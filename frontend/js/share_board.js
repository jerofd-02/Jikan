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

    // Se genera el enlace de invitación. TODO: AJUSTAR A LA LOGICA
    const boardId = getCurrentBoardId(); // TODO: AJUSTAR A NUESTRA LOGICA
    const shareUrl = `${window.location.origin}${window.location.pathname}?board=${boardId}`;

    dropdown.innerHTML = `
        <div class="share-header">
            <i class="fa-solid fa-share-nodes"></i>
            <span>Compartir tablero</span>
        </div>

        <div class="share-section">
            <label class="share-label">Invitar por correo</label>
            <div class="share-email-row">
                <input
                    type="email"
                    id="share-email-input"
                    class="share-email-input"
                    placeholder="correo@ejemplo.com"
                    autocomplete="off"
                />
                <button class="share-send-btn" id="share-send-btn">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
            <p class="share-feedback hidden" id="share-feedback"></p>
        </div>

        <div class="share-divider">
            <span>o</span>
        </div>

        <div class="share-section">
            <label class="share-label">Enlace del tablero</label>
            <div class="share-link-row">
                <input
                    type="text"
                    class="share-link-input"
                    id="share-link-input"
                    value="${shareUrl}"
                    readonly
                />
                <button class="share-copy-btn" id="share-copy-btn" title="Copiar enlace">
                    <i class="fa-regular fa-copy"></i>
                </button>
            </div>
        </div>
    `;


    // TODO: Enviar invitación por correo (DUMMY)
    dropdown.querySelector('#share-send-btn').addEventListener('click', () => {
        const input = dropdown.querySelector('#share-email-input');
        const feedback = dropdown.querySelector('#share-feedback');
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            showShareFeedback(feedback, 'Introduce un correo válido.', 'error');
            return;
        }

        // TODO: HAY QUE CONECTAR CON EL BACKEND LAS INVITACIONES (por ahora se simula éxito)
        showShareFeedback(feedback, `Invitación enviada a ${email}`, 'success');
        input.value = '';
    });

    // Copiar enlace al portapapeles
    dropdown.querySelector('#share-copy-btn').addEventListener('click', () => {
        const linkInput = dropdown.querySelector('#share-link-input');
        navigator.clipboard.writeText(linkInput.value).then(() => {
            const copyBtn = dropdown.querySelector('#share-copy-btn');
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
                copyBtn.classList.remove('copied');
            }, 2000);
        });
    });
}

function showShareFeedback(el, msg, type) {
    el.textContent = msg;
    el.className = `share-feedback share-feedback--${type}`;
    setTimeout(() => {
        el.className = 'share-feedback hidden';
    }, 3000);
}

// TODO: AJUSTAR A NUESTRA LOGICA SEGN LOS IDS DEL TABLERO
function getCurrentBoardId() {
    return new URLSearchParams(window.location.search).get('board') || 'default';
}

document.addEventListener('DOMContentLoaded', () => {
    initShareButton();
});