const BASE_URL = "http://localhost:3000";

const getData = async (link) => {
    try {
        const response = await fetch(link);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const overlay   = document.getElementById('create-board-popup');
    const btnCerrar = document.getElementById('cerrarPopup');

    // Listeners para el funcionamiento del popup
    document.addEventListener('click', (e) => {
        if (e.target.closest('#crearTablero')) {
            overlay.classList.add('activo');
        }
    });

    btnCerrar.addEventListener('click', () => {
        overlay.classList.remove('activo');
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('activo');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.classList.remove('activo');
    });
});
