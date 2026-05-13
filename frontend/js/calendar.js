const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const REFRESH_INTERVAL_MS = 30_000;
let currentBoardId = null

function waitForCalendar() {
    const container = document.querySelector('[data-template="calendar"]');
    if (container && container.querySelector('.calendar-wrap')) {
        initCalendar(container);
        return;
    }
    let attempts = 0;
    const maxAttempts = 100;
    const observer = new MutationObserver(() => {
        const container = document.querySelector('[data-template="calendar"]');
        if (container && container.querySelector('.calendar-wrap')) {
            observer.disconnect();
            initCalendar(container);
        } else if (++attempts >= maxAttempts) {
            observer.disconnect();
            console.error('Calendar template not loaded within timeout');
        }
    });
    observer.observe(document.body, {childList: true, subtree: true});
}

document.addEventListener('DOMContentLoaded', waitForCalendar);

function toLocalDateString(value) {
    if (!value) return null;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (isNaN(d)) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function buildDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function fetchTasksByDate(boardId) {
    if (!boardId) return {byDate: new Map(), byDeadline: new Map()};
    const url = `http://localhost:3000/tasks/board/${boardId}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'}
        });
        if (!response.ok) {
            console.error('Error al obtener tareas:', response.status);
            return {byDate: new Map(), byDeadline: new Map()};
        }
        const tasks = await response.json();
        const byDate = new Map();
        const byDeadline = new Map();
        const addToMap = (map, key, task) => {
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(task);
        };
        tasks.forEach(task => {
            const dateKey = toLocalDateString(task.date);
            const deadlineKey = toLocalDateString(task.deadline);
            if (dateKey) addToMap(byDate, dateKey, task);
            if (deadlineKey) addToMap(byDeadline, deadlineKey, task);
        });
        return {byDate, byDeadline};
    } catch (err) {
        console.error('Error al obtener tareas:', err);
        return {byDate: new Map(), byDeadline: new Map()};
    }
}

function openTaskEditModal(task) {
    console.log('[Calendar] openTaskEdit ->', task);
    document.dispatchEvent(
        new CustomEvent('openTaskEdit', {detail: {task}, bubbles: true})
    );
}

const POPOVER_ID = 'day-tasks-popover';

function onOutsideClick(e) {
    const popover = document.getElementById(POPOVER_ID);
    if (popover && !popover.contains(e.target)) closeDayPopover();
}

function closeDayPopover() {
    const existing = document.getElementById(POPOVER_ID);
    if (existing) existing.remove();
    document.removeEventListener('click', onOutsideClick);
}

function showDayPopover(cell, dateKey, entries) {
    closeDayPopover();

    const popover = document.createElement('div');
    popover.id = POPOVER_ID;
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', `Tareas del día ${dateKey}`);

    const header = document.createElement('div');
    header.className = 'day-popover__header';

    const title = document.createElement('span');
    title.className = 'day-popover__title';
    title.textContent = dateKey;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'day-popover__close';
    closeBtn.type = 'button';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDayPopover();
    });

    header.appendChild(title);
    header.appendChild(closeBtn);
    popover.appendChild(header);

    entries.forEach(({task, type}) => {
        const item = document.createElement('button');
        item.className = `day-popover__item task-chip task-chip--${type}`;
        item.type = 'button';
        item.title = type === 'deadline' ? `Fecha límite: ${task.name}` : task.name;
        item.textContent = task.name;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            closeDayPopover();
            openTaskEditModal(task);
        });
        popover.appendChild(item);
    });

    document.body.appendChild(popover);

    const cellRect = cell.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    let top = cellRect.bottom + scrollTop + 4;
    let left = cellRect.left + scrollLeft;

    if (left + popRect.width > window.innerWidth - 8)
        left = window.innerWidth - popRect.width - 8;

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    setTimeout(() => document.addEventListener('click', onOutsideClick), 0);
}

function initCalendar(container) {
    const today = new Date();
    let current = {year: today.getFullYear(), month: today.getMonth()};
    let tasksByDate = new Map();
    let tasksByDeadline = new Map();

    const wRow = container.querySelector('#weekdays-row');
    wRow.innerHTML = '';
    WEEKDAYS_SHORT.forEach((d, i) => {
        const c = document.createElement('div');
        c.className = 'weekday-cell' + (i === 5 || i === 6 ? ' weekend' : '');
        c.textContent = d;
        wRow.appendChild(c);
    });

    const grid = container.querySelector('#days-grid');
    let cells = [];
    grid.style.transition = 'opacity 0.3s ease-in-out';

    function toMondayFirst(jsDay) {
        return (jsDay + 6) % 7;
    }

    async function render() {
        grid.style.opacity = '0';
        closeDayPopover();

        ({byDate: tasksByDate, byDeadline: tasksByDeadline} = await fetchTasksByDate(currentBoardId));

        setTimeout(() => {
            const {year, month} = current;

            container.querySelector('#sidebar-month').textContent = MONTHS[month];
            container.querySelector('#sidebar-year').textContent = year;
            container.querySelector('#sidebar-weekday').textContent =
                `${WEEKDAYS_FULL[toMondayFirst(today.getDay())]} ${today.getDate()}`;

            const first = new Date(year, month, 1);
            const startDay = toMondayFirst(first.getDay());
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const totalCells = 42;

            if (cells.length !== totalCells) {
                grid.innerHTML = '';
                cells = [];
                const fragment = document.createDocumentFragment();
                for (let i = 0; i < totalCells; i++) {
                    const cell = document.createElement('div');
                    cell.className = 'day-cell';
                    const span = document.createElement('span');
                    span.className = 'day-num';
                    cell.appendChild(span);
                    fragment.appendChild(cell);
                    cells.push(cell);
                }
                grid.appendChild(fragment);
            }

            const daysInPrev = new Date(year, month, 0).getDate();

            cells.forEach((cell, i) => {
                const newCell = cell.cloneNode(false);
                const span = document.createElement('span');
                span.className = 'day-num';
                newCell.appendChild(span);
                cell.parentNode.replaceChild(newCell, cell);
                cells[i] = newCell;

                let dayNum, isOther = false, jsDay, cellYear, cellMonth;

                if (i < startDay) {
                    dayNum = daysInPrev - startDay + 1 + i;
                    isOther = true;
                    cellYear = month === 0 ? year - 1 : year;
                    cellMonth = month === 0 ? 11 : month - 1;
                    jsDay = new Date(cellYear, cellMonth, dayNum).getDay();
                } else if (i >= startDay + daysInMonth) {
                    dayNum = i - startDay - daysInMonth + 1;
                    isOther = true;
                    cellYear = month === 11 ? year + 1 : year;
                    cellMonth = month === 11 ? 0 : month + 1;
                    jsDay = new Date(cellYear, cellMonth, dayNum).getDay();
                } else {
                    dayNum = i - startDay + 1;
                    cellYear = year;
                    cellMonth = month;
                    jsDay = new Date(year, month, dayNum).getDay();
                }

                const isWeekend = jsDay === 0 || jsDay === 6;
                const isToday = !isOther
                    && dayNum === today.getDate()
                    && month === today.getMonth()
                    && year === today.getFullYear();

                cells[i].className = 'day-cell';
                if (isOther) cells[i].classList.add('other-month');
                if (isWeekend) cells[i].classList.add('weekend-day');
                if (isToday) cells[i].classList.add('today');

                span.textContent = dayNum;

                const dateKey = buildDateKey(cellYear, cellMonth, dayNum);
                const entries = [
                    ...(tasksByDate.get(dateKey) || []).map(t => ({task: t, type: 'date'})),
                    ...(tasksByDeadline.get(dateKey) || []).map(t => ({task: t, type: 'deadline'})),
                ];

                const MAX_VISIBLE = 3;
                const visible = entries.slice(0, MAX_VISIBLE);
                const overflow = entries.length - MAX_VISIBLE;

                visible.forEach(({task, type}) => {
                    const chip = document.createElement('button');
                    chip.className = `task-chip task-chip--${type}`;
                    chip.type = 'button';
                    chip.title = type === 'deadline' ? `Fecha límite: ${task.name}` : task.name;
                    chip.textContent = task.name;
                    chip.setAttribute('aria-label', `Editar tarea: ${task.name}`);
                    chip.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openTaskEditModal(task);
                    });
                    cells[i].appendChild(chip);
                });

                if (overflow > 0) {
                    const more = document.createElement('button');
                    more.className = 'task-chip task-chip--overflow';
                    more.type = 'button';
                    more.textContent = `+${overflow} más`;
                    more.setAttribute('aria-label', `Ver ${overflow} tareas más`);
                    more.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showDayPopover(cells[i], dateKey, entries);
                    });
                    cells[i].appendChild(more);
                }

                cells[i].addEventListener('click', (e) => {
                    if (e.target === cells[i] && overflow > 0)
                        showDayPopover(cells[i], dateKey, entries);
                });
            });

            grid.style.opacity = '1';
        }, 150);
    }

    container.querySelector('#prev-btn').addEventListener('click', () => {
        current.month--;
        if (current.month < 0) {
            current.month = 11;
            current.year--;
        }
        render();
    });

    container.querySelector('#next-btn').addEventListener('click', () => {
        current.month++;
        if (current.month > 11) {
            current.month = 0;
            current.year++;
        }
        render();
    });

    document.addEventListener('taskUpdated', () => render());

    document.addEventListener('boardChanged', (e) => {
        currentBoardId = e.detail?.boardId ?? null;
        render();
    });

    let refreshTimer = setInterval(() => render(), REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(refreshTimer);
        } else {
            render();
            refreshTimer = setInterval(() => render(), REFRESH_INTERVAL_MS);
        }
    });

    render();
}