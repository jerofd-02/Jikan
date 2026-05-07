// calendar.js
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

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

    observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', waitForCalendar);

function initCalendar(container) {
    const today = new Date();
    let current = {year: today.getFullYear(), month: today.getMonth()};

    // Crear cabecera
    const wRow = container.querySelector('#weekdays-row');
    wRow.innerHTML = '';
    WEEKDAYS_SHORT.forEach((d, i) => {
        const c = document.createElement('div');
        c.className = 'weekday-cell' + (i === 5 || i === 6 ? ' weekend' : '');
        c.textContent = d;
        wRow.appendChild(c);
    });

    const grid = container.querySelector('#days-grid');
    let cells = []; // Array para reutilizar celdas

    // Añadir transición de opacidad al grid
    grid.style.transition = 'opacity 0.3s ease-in-out';

    // Convierte getDay() (0=Dom…6=Sáb) a índice lunes-primero (0=Lun…6=Dom)
    function toMondayFirst(jsDay) {
        return (jsDay + 6) % 7;
    }

    function render() {
        // Fade out antes de actualizar
        grid.style.opacity = '0';

        setTimeout(() => {
            const {year, month} = current;

            // Actualizar sidebar
            container.querySelector('#sidebar-month').textContent = MONTHS[month];
            container.querySelector('#sidebar-year').textContent = year;
            container.querySelector('#sidebar-weekday').textContent = `${WEEKDAYS_FULL[toMondayFirst(today.getDay())]} ${today.getDate()}`;

            // Calcular días necesarios
            const first = new Date(year, month, 1);
            const startDay = toMondayFirst(first.getDay());
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const totalCells = 42;

            // Si número de celdas cambió, recrear
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

            // Actualizar contenido de celdas existentes
            const daysInPrev = new Date(year, month, 0).getDate();
            cells.forEach((cell, i) => {
                const span = cell.querySelector('.day-num');
                let dayNum, isOther = false, jsDay;

                if (i < startDay) {
                    dayNum = daysInPrev - startDay + 1 + i;
                    isOther = true;
                    jsDay = new Date(year, month - 1, dayNum).getDay();
                } else if (i >= startDay + daysInMonth) {
                    dayNum = i - startDay - daysInMonth + 1;
                    isOther = true;
                    jsDay = new Date(year, month + 1, dayNum).getDay();
                } else {
                    dayNum = i - startDay + 1;
                    jsDay = new Date(year, month, dayNum).getDay();
                }

                const isWeekend = jsDay === 0 || jsDay === 6;
                const isToday = !isOther && dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                // Resetear clases y aplicar nuevas
                cell.className = 'day-cell';
                if (isOther) cell.classList.add('other-month');
                if (isWeekend) cell.classList.add('weekend-day');
                if (isToday) cell.classList.add('today');

                span.textContent = dayNum;
            });

            // Fade in después de actualizar
            grid.style.opacity = '1';
        }, 150); // Tiempo de fade out
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

    render();
}