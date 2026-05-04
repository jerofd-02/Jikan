// ─────────────────────────────────────────────
//  JIKAN — Sistema de Recordatorios
// ─────────────────────────────────────────────

const REMINDERS_KEY = 'jikan_reminders';
const DISMISSED_KEY = 'jikan_dismissed';

// ── Persistencia ──────────────────────────────

function loadReminders() {
    try {
        return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveReminders(reminders) {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

// ── Utilidades de tiempo ──────────────────────

function msToLabel(ms) {
    const totalMin = Math.floor(ms / (1000 * 60));
    const totalH   = Math.floor(ms / (1000 * 60 * 60));
    const totalD   = Math.floor(ms / (1000 * 60 * 60 * 24));
    const totalW   = Math.floor(ms / (1000 * 60 * 60 * 24 * 7));

    if (totalW >= 1 && ms % (7 * 24 * 60 * 60 * 1000) === 0)
        return `${totalW} semana${totalW > 1 ? 's' : ''}`;
    if (totalD >= 1 && ms % (24 * 60 * 60 * 1000) === 0)
        return `${totalD} día${totalD > 1 ? 's' : ''}`;
    if (totalH >= 1 && ms % (60 * 60 * 1000) === 0)
        return `${totalH} hora${totalH > 1 ? 's' : ''}`;
    if (totalMin >= 1)
        return `${totalMin} minuto${totalMin > 1 ? 's' : ''}`;
    return `${ms / 1000} segundo${ms / 1000 !== 1 ? 's' : ''}`;
}

// ── Notificaciones activas ────────────────────

let activeNotifications = [];

function checkReminders() {
    const reminders = loadReminders();
    const dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
    const now = Date.now();
    let changed = false;

    reminders.forEach(r => {
        if (!r.fired && now >= r.fireAt) {
            r.fired = true;
            changed = true;
        }
        if (r.fired && !dismissed.includes(r.id) && !activeNotifications.find(n => n.id === r.id)) {
            activeNotifications.push(r);
        }
    });

    if (changed) saveReminders(reminders);
    updateBellBadge();
    renderNotificationDropdown();
}

function updateBellBadge() {
    const btn = document.querySelector('.notifications-button');
    if (!btn) return;

    let badge = btn.querySelector('.notif-badge');
    if (activeNotifications.length > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notif-badge';
            btn.appendChild(badge);
        }
        badge.textContent = activeNotifications.length > 9 ? '9+' : activeNotifications.length;
    } else {
        badge?.remove();
    }
}

// ── Dropdown de notificaciones ────────────────

function renderNotificationDropdown() {
    let dropdown = document.getElementById('notif-dropdown');
    if (!dropdown) return;

    if (activeNotifications.length === 0) {
        dropdown.innerHTML = `
            <div class="notif-empty">
                <i class="fa-regular fa-bell-slash"></i>
                <span>Sin recordatorios pendientes</span>
            </div>`;
        return;
    }

    dropdown.innerHTML = `
        <div class="notif-header">
            <span>Recordatorios</span>
            <button class="notif-clear-all" id="notif-clear-all">Limpiar todo</button>
        </div>
        <ul class="notif-list">
            ${activeNotifications.map(n => `
                <li class="notif-item" data-id="${n.id}">
                    <div class="notif-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
                    <div class="notif-body">
                        <p class="notif-msg">Recuerda que la tarea <strong>${escapeHtml(n.taskName)}</strong> ha pasado <strong>${n.label}</strong>, ¡realízala lo antes posible!</p>
                        <span class="notif-time">${formatTimestamp(n.fireAt)}</span>
                    </div>
                    <button class="notif-dismiss" data-id="${n.id}" title="Descartar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </li>`).join('')}
        </ul>`;

    dropdown.querySelector('#notif-clear-all')?.addEventListener('click', () => {
        const dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
        activeNotifications.forEach(n => {
            if (!dismissed.includes(n.id)) dismissed.push(n.id);
        });
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
        activeNotifications = [];
        updateBellBadge();
        renderNotificationDropdown();
    });

    dropdown.querySelectorAll('.notif-dismiss').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
            dismissed.push(id);
            localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
            activeNotifications = activeNotifications.filter(n => n.id !== id);
            updateBellBadge();
            renderNotificationDropdown();
        });
    });
}

function formatTimestamp(ts) {
    return new Date(ts).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── Bell button toggle ────────────────────────

function initBellButton() {
    const btn = document.querySelector('.notifications-button');
    if (!btn) return;

    let dropdown = document.createElement('div');
    dropdown.id = 'notif-dropdown';
    dropdown.className = 'notif-dropdown hidden';

    btn.parentElement.style.position = 'relative';
    btn.parentElement.appendChild(dropdown);

    renderNotificationDropdown();

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            renderNotificationDropdown();
        }
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== btn) {
            dropdown.classList.add('hidden');
        }
    });
}

// ── Agregar recordatorio a una tarea ─────────

export function openReminderDialog(taskId, taskName) {
    const bg = getComputedStyle(document.documentElement)
        .getPropertyValue('--background3-color').trim();
    const fg = getComputedStyle(document.documentElement)
        .getPropertyValue('--font-color').trim();

    Swal.fire({
        title: 'Establecer recordatorio',
        background: bg,
        color: fg,
        customClass: { popup: 'swal-custom-popup swal-reminder-popup' },
        html: `
            <p class="reminder-subtitle">¿Cuándo quieres que te recordemos esta tarea?</p>
            <div class="reminder-options">
                <button type="button" class="reminder-preset" data-ms="${60 * 60 * 1000}">
                    <i class="fa-regular fa-clock"></i>
                    <span>1 hora</span>
                </button>
                <button type="button" class="reminder-preset" data-ms="${24 * 60 * 60 * 1000}">
                    <i class="fa-regular fa-clock"></i>
                    <span>1 día</span>
                </button>
                <button type="button" class="reminder-preset" data-ms="${7 * 24 * 60 * 60 * 1000}">
                    <i class="fa-regular fa-clock"></i>
                    <span>1 semana</span>
                </button>
            </div>
            <div class="reminder-custom-wrap">
                <p class="reminder-custom-label">O elige una hora personalizada:</p>
                <div class="reminder-custom-inputs">
                    <input type="number" id="custom-days" min="0" max="365" value="0" placeholder="Días">
                    <label>días</label>
                    <input type="number" id="custom-hours" min="0" max="23" value="0" placeholder="Horas">
                    <label>horas</label>
                    <input type="number" id="custom-minutes" min="0" max="59" value="0" placeholder="Min">
                    <label>min</label>
                </div>
                <button type="button" class="reminder-custom-confirm" id="reminder-custom-btn">
                    <i class="fa-solid fa-bell"></i> Recordar en este tiempo
                </button>
            </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            document.querySelectorAll('.reminder-preset').forEach(btn => {
                btn.addEventListener('click', () => {
                    const ms = parseInt(btn.dataset.ms);
                    scheduleReminder(taskId, taskName, ms);
                    Swal.close();
                });
            });

            document.getElementById('reminder-custom-btn').addEventListener('click', () => {
                const d = parseInt(document.getElementById('custom-days').value) || 0;
                const h = parseInt(document.getElementById('custom-hours').value) || 0;
                const m = parseInt(document.getElementById('custom-minutes').value) || 0;
                const ms = ((d * 24 * 60) + (h * 60) + m) * 60 * 1000;
                if (ms <= 0) {
                    document.getElementById('reminder-custom-btn').classList.add('shake');
                    setTimeout(() => document.getElementById('reminder-custom-btn')?.classList.remove('shake'), 500);
                    return;
                }
                scheduleReminder(taskId, taskName, ms);
                Swal.close();
            });
        }
    });
}

function scheduleReminder(taskId, taskName, delayMs) {
    const reminders = loadReminders();
    const now = Date.now();
    const reminder = {
        id: `${taskId}_${now}`,
        taskId,
        taskName,
        label: msToLabel(delayMs),
        createdAt: now,
        fireAt: now + delayMs,
        fired: false,
    };
    reminders.push(reminder);
    saveReminders(reminders);

    const bg = getComputedStyle(document.documentElement)
        .getPropertyValue('--background3-color').trim();
    const fg = getComputedStyle(document.documentElement)
        .getPropertyValue('--font-color').trim();

    Swal.fire({
        icon: 'success',
        title: '¡Recordatorio creado!',
        html: `Te avisaremos sobre <strong>${escapeHtml(taskName)}</strong> en <strong>${msToLabel(delayMs)}</strong>.`,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        background: bg,
        color: fg,
        customClass: { popup: 'swal-custom-popup' },
    });
}

// ── Init ──────────────────────────────────────

export function initReminders() {
    initBellButton();
    checkReminders();
    setInterval(checkReminders, 10000); // comprobar cada 10s
}