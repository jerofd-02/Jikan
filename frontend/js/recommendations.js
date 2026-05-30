emailjs.init('HhyUHgszvMXVLu16f');

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#section-recommendations form')
        .addEventListener('submit', async (e) => {
            e.preventDefault();

            const from_name = document.getElementById('nombre').value.trim() || 'Anónimo';
            const subject   = document.getElementById('asunto').value.trim();
            const message   = document.getElementById('recommendations').value.trim();

            if (!subject) return Swal.fire({
                toast: true, position: 'bottom-end', icon: 'error',
                title: 'El asunto no puede estar vacío',
                showConfirmButton: false, timer: 3000,
                background: getComputedStyle(document.documentElement).getPropertyValue('--background3-color').trim(),
                color: getComputedStyle(document.documentElement).getPropertyValue('--font-color').trim(),
                customClass: { popup: 'swal-custom-popup' },
            });

            if (!message) return Swal.fire({
                toast: true, position: 'bottom-end', icon: 'error',
                title: 'El mensaje no puede estar vacío',
                showConfirmButton: false, timer: 3000,
                background: getComputedStyle(document.documentElement).getPropertyValue('--background3-color').trim(),
                color: getComputedStyle(document.documentElement).getPropertyValue('--font-color').trim(),
                customClass: { popup: 'swal-custom-popup' },
            });

            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Enviando...';

            try {
                await emailjs.send('service_59zz0zu', 'template_2y3nmg1', {
                    from_name,
                    subject,
                    message,
                });

                Swal.fire({
                    toast: true, position: 'bottom-end', icon: 'success',
                    title: '¡Mensaje enviado!',
                    showConfirmButton: false, timer: 3000,
                    background: getComputedStyle(document.documentElement).getPropertyValue('--background3-color').trim(),
                    color: getComputedStyle(document.documentElement).getPropertyValue('--font-color').trim(),
                    customClass: { popup: 'swal-custom-popup' },
                });

                e.target.reset();

            } catch (err) {
                console.error('EmailJS error:', err);
                Swal.fire({
                    toast: true, position: 'bottom-end', icon: 'error',
                    title: 'Error al enviar, inténtalo de nuevo',
                    showConfirmButton: false, timer: 3000,
                    background: getComputedStyle(document.documentElement).getPropertyValue('--background3-color').trim(),
                    color: getComputedStyle(document.documentElement).getPropertyValue('--font-color').trim(),
                    customClass: { popup: 'swal-custom-popup' },
                });
            } finally {
                btn.disabled = false;
                btn.textContent = 'Enviar mensaje';
            }
        });
});