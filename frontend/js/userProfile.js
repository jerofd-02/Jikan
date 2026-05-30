const API = '/api';

function showToast(msg, ok = true) {
    Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: ok ? 'success' : 'error',
        title: msg,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: 'swal-custom-popup' },
        background: getComputedStyle(document.documentElement).getPropertyValue('--background3-color').trim(),
        color:      getComputedStyle(document.documentElement).getPropertyValue('--font-color').trim(),
    });
}

async function loadUserData() {
    try {
        const res = await fetch(`${API}/auth/verify`, { credentials: 'include' });
        if (!res.ok) return;
        const { name, mail, avatar_url } = await res.json();

        document.getElementById('username').placeholder = name || '';
        document.getElementById('email').placeholder    = mail || '';

        const sidebarName = document.querySelector('aside h3');
        if (sidebarName) sidebarName.textContent = name || '';

        if (avatar_url) {
            const avatarWrapper = document.querySelector('.avatar-wrapper');
            if (avatarWrapper) avatarWrapper.style.backgroundImage = `url(${avatar_url})`;
        }

        const sidebarImg = document.querySelector('aside .user-img');
        if (sidebarImg && avatar_url) {
            sidebarImg.style.backgroundImage = `url(${avatar_url})`;
            sidebarImg.style.backgroundSize = 'cover';
            sidebarImg.style.backgroundPosition = 'center';
        }

    } catch (e) {
        console.error('Error cargando datos de usuario:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    loadUserData();

    // ── Cambiar nombre ────────────────────────────────────────────
    document.querySelector('#section-account-info form:nth-of-type(1)')
        .addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('username').value.trim();
            if (!name) return showToast('Escribe un nombre', false);

            const res = await fetch(`${API}/users/name`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name }),
            });
            const data = await res.json();

            if (res.ok) {
                showToast('Nombre actualizado');
                document.getElementById('username').value = '';
                document.getElementById('username').placeholder = name;
                const sidebarName = document.querySelector('aside h3');
                if (sidebarName) sidebarName.textContent = name;
                localStorage.setItem('userName', name);
            } else {
                showToast(data.message || 'Error al actualizar', false);
            }
        });

    // ── Cambiar correo ────────────────────────────────────────────
    document.querySelector('#section-account-info form:nth-of-type(2)')
        .addEventListener('submit', async (e) => {
            e.preventDefault();
            const mail = document.getElementById('email').value.trim();
            if (!mail) return showToast('Escribe un correo', false);

            const res = await fetch(`${API}/users/mail`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ mail }),
            });
            const data = await res.json();

            if (res.ok) {
                showToast('Correo actualizado');
                document.getElementById('email').value = '';
                document.getElementById('email').placeholder = mail;
                localStorage.setItem('userMail', mail);
            } else {
                showToast(data.message || 'Error al actualizar', false);
            }
        });

    // ── Cambiar contraseña ────────────────────────────────────────
    document.querySelector('#section-security form')
        .addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('password').value;
            const newPassword     = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!currentPassword || !newPassword || !confirmPassword)
                return showToast('Rellena todos los campos', false);

            if (newPassword !== confirmPassword)
                return showToast('Las contraseñas nuevas no coinciden', false);

            const res = await fetch(`${API}/users/password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                showToast('Contraseña actualizada');
                document.getElementById('password').value         = '';
                document.getElementById('new-password').value     = '';
                document.getElementById('confirm-password').value = '';
            } else {
                showToast(data.message || 'Error al actualizar', false);
            }
        });

    // ── Avatar ────────────────────────────────────────────────────
    const avatarWrapper = document.querySelector('.avatar-wrapper');
    const avatarInput   = document.getElementById('avatarInput');

    if (avatarWrapper && avatarInput) {
        avatarWrapper.addEventListener('click', () => avatarInput.click());

        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const res = await fetch(`${API}/users/avatar`, {
                    method: 'PATCH',
                    credentials: 'include',
                    body: formData,
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                avatarWrapper.style.backgroundImage = `url(${data.avatar_url})`;
                showToast('Avatar actualizado');

            } catch (err) {
                console.error(err);
                showToast('Error al subir el avatar', false);
            }
        });
    }
});