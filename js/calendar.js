// calendar.js

function waitForCalendar() {
    const container = document.querySelector('[data-template="calendar"]');
    if (container && container.querySelector('.calendar-wrap')) {
        initCalendar(container);
    } else {
        setTimeout(waitForCalendar, 50);
    }
}

document.addEventListener('DOMContentLoaded', waitForCalendar);

function initCalendar(container) {
    const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const WEEKDAYS_FULL = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
    const WEEKDAYS_SHORT = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

    const today = new Date();
    let current = { year: today.getFullYear(), month: today.getMonth() };

    // Convierte getDay() (0=Dom…6=Sáb) a índice lunes-primero (0=Lun…6=Dom)
    function toMondayFirst(jsDay) {
        return (jsDay + 6) % 7;
    }

    function render() {
        const { year, month } = current;

        container.querySelector('#sidebar-month').textContent = MONTHS[month];
        container.querySelector('#sidebar-year').textContent = year;

        const first = new Date(year, month, 1);
        // Usamos toMondayFirst para mostrar el día correcto en el sidebar
        container.querySelector('#sidebar-weekday').textContent = WEEKDAYS_FULL[toMondayFirst(first.getDay())];

        // Cabecera de días de la semana
        const wRow = container.querySelector('#weekdays-row');
        wRow.innerHTML = '';
        WEEKDAYS_SHORT.forEach((d, i) => {
            const c = document.createElement('div');
            // Sábado=5, Domingo=6 en índice lunes-primero
            c.className = 'weekday-cell' + (i === 5 || i === 6 ? ' weekend' : '');
            c.textContent = d;
            wRow.appendChild(c);
        });

        // Cuadrícula de días
        const grid = container.querySelector('#days-grid');
        grid.innerHTML = '';

        // startDay ahora es 0=Lun … 6=Dom
        const startDay = toMondayFirst(first.getDay());
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrev = new Date(year, month, 0).getDate();

        for (let i = 0; i < 42; i++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';

            let dayNum, isOther = false, jsDay;

            if (i < startDay) {
                // Días del mes anterior
                dayNum = daysInPrev - startDay + 1 + i;
                isOther = true;
                jsDay = new Date(year, month - 1, dayNum).getDay();
            } else if (i >= startDay + daysInMonth) {
                // Días del mes siguiente
                dayNum = i - startDay - daysInMonth + 1;
                isOther = true;
                jsDay = new Date(year, month + 1, dayNum).getDay();
            } else {
                // Días del mes actual
                dayNum = i - startDay + 1;
                jsDay = new Date(year, month, dayNum).getDay();
            }

            // Fin de semana: sábado (6) o domingo (0) en notación JS
            const isWeekend = jsDay === 0 || jsDay === 6;

            if (isOther) cell.classList.add('other-month');
            if (isWeekend) cell.classList.add('weekend-day');
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