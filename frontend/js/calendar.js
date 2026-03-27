// calendar.js

function waitForCalendar() {
    const container = document.querySelector('[data-template="calendar"]');
    // si el div existe y tiene el calendario dentro, inicializamos
    if (container && container.querySelector('.calendar-wrap')) {
        initCalendar(container);
    } else {
        // esperamos 50ms y probamos otra vez
        setTimeout(waitForCalendar, 50);
    }
}

document.addEventListener('DOMContentLoaded', waitForCalendar);

function initCalendar(container) {
    const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const WEEKDAYS_FULL = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const WEEKDAYS_SHORT = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

    const today = new Date();
    let current = { year: today.getFullYear(), month: today.getMonth() };

    function render() {
        const { year, month } = current;

        container.querySelector('#sidebar-month').textContent = MONTHS[month];
        container.querySelector('#sidebar-year').textContent = year;
        const first = new Date(year, month, 1);
        container.querySelector('#sidebar-weekday').textContent = WEEKDAYS_FULL[first.getDay()];

        // Weekday headers
        const wRow = container.querySelector('#weekdays-row');
        wRow.innerHTML = '';
        WEEKDAYS_SHORT.forEach((d, i) => {
            const c = document.createElement('div');
            c.className = 'weekday-cell' + (i === 0 || i === 6 ? ' weekend' : '');
            c.textContent = d;
            wRow.appendChild(c);
        });

        // Days
        const grid = container.querySelector('#days-grid');
        grid.innerHTML = '';

        const startDay = first.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrev = new Date(year, month, 0).getDate();

        for (let i = 0; i < 42; i++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';

            let dayNum, isOther = false, dayOfWeek;

            if (i < startDay) {
                dayNum = daysInPrev - startDay + 1 + i;
                isOther = true;
                dayOfWeek = new Date(year, month - 1, dayNum).getDay();
            } else if (i >= startDay + daysInMonth) {
                dayNum = i - startDay - daysInMonth + 1;
                isOther = true;
                dayOfWeek = new Date(year, month + 1, dayNum).getDay();
            } else {
                dayNum = i - startDay + 1;
                dayOfWeek = new Date(year, month, dayNum).getDay();
            }

            if (isOther) cell.classList.add('other-month');
            if (dayOfWeek === 0 || dayOfWeek === 6) cell.classList.add('weekend-day');
            if (!isOther && dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                cell.classList.add('today');
            }

            const span = document.createElement('span');
            span.className = 'day-num';
            span.textContent = dayNum;
            cell.appendChild(span);
            grid.appendChild(cell);
        }
    }

    container.querySelector('#prev-btn').addEventListener('click', () => {
        current.month--;
        if (current.month < 0) { current.month = 11; current.year--; }
        render();
    });

    container.querySelector('#next-btn').addEventListener('click', () => {
        current.month++;
        if (current.month > 11) { current.month = 0; current.year++; }
        render();
    });

    render();
}