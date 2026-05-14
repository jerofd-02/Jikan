function initShareButton() {
    const btn = document.querySelector('.share-button');
    if (!btn) return;

    let dropdown = document.createElement('div');
    dropdown.id = 'share-dropdown';
    dropdown.className = 'share-dropdown hidden';

    btn.parentElement.style.position = 'relative';
    btn.parentElement.appendChild(dropdown);

    renderShareDropdown();

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== btn) {
            dropdown.classList.add('hidden');
        }
    });
}

function renderShareDropdown() {
    const dropdown = document.getElementById('share-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = `
        <div class="share-header">
            <i class="fa-solid fa-share-nodes"></i>
            <span>Compartir tablero</span>
        </div>
        <div class="share-section">
            <label class="share-label">Invitar por correo</label>
            <div class="share-email-row">
                <input type="email" id="share-email-input" class="share-email-input" placeholder="correo@ejemplo.com" autocomplete="off" />
                <button class="share-send-btn" id="share-send-btn">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
            <p class="share-feedback hidden" id="share-feedback"></p>
        </div>
    `;

    const sendBtn = dropdown.querySelector('#share-send-btn');
    sendBtn.addEventListener('click', async () => {
        const input = dropdown.querySelector('#share-email-input');
        const feedback = dropdown.querySelector('#share-feedback');
        const email = input.value.trim();
        const boardId = getCurrentBoardId();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showShareFeedback(feedback, 'Introduce un correo válido.', 'error');
            return;
        }

        try {
            const res = await fetch('/api/invitations/send', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({board_id: boardId, invited_mail: email}),
                credentials: 'include'
            });

            const data = await res.json();
            if (!res.ok) {
                showShareFeedback(feedback, data.error || 'Error al enviar.', 'error');
                return;
            }

            showShareFeedback(feedback, `Invitación enviada a ${email}`, 'success');
            input.value = '';
        } catch (err) {
            showShareFeedback(feedback, 'Error de red.', 'error');
        }
    });
}

function showShareFeedback(el, msg, type) {
    el.textContent = msg;
    el.className = `share-feedback share-feedback--${type}`;
    setTimeout(() => {
        el.className = 'share-feedback hidden';
    }, 3000);
}

function getCurrentBoardId() {
    return document.querySelector('.boards-section')?.dataset.boardId || null;
}

document.addEventListener('DOMContentLoaded', () => {
    initShareButton();
});