const BASE_URL = "/api";

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

const insertarTableroEnHTML = (nombre) => {

    let seccionBotones = document.getElementById("boards-buttons");
    let botones = seccionBotones.querySelectorAll("button");

    if (!nombre) {
        console.error("No se puede insertar un nombre vacío");
        return;
    };

    let nuevoTablero = document.createElement("button");
    nuevoTablero.textContent = nombre;

    seccionBotones.insertBefore(nuevoTablero, botones[botones.length - 1]);
};

const insertarTableroEnDB = async (name) => {
    try {

        const boardres = await fetch(`${BASE_URL}/boards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        if (!boardres.ok) {
            throw new Error('Error al crear el tablero');
        }

        const board = await boardres.json();
        const boardId = board.board_id;

        // 2. Columnas por defecto
        const defaultColumns = ['Por hacer', 'En progreso', 'Terminado'];

        // 3. Crear columnas en paralelo (más eficiente)
        await Promise.all(defaultColumns.map(colName => 
            fetch(`${BASE_URL}/boards/${boardId}/columns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: colName })
            })
        ));

        return board;

    } catch (error) {
        console.error(error);
        throw error;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById('create-board-popup');
    const creacionPersonalizada = document.getElementById('fast-creation-popup');

    const btnsCerrar = document.getElementsByClassName('btn-cerrar');

    const btnCreacionRapida = document.getElementById('fast-board-button');
    const btnCreacionPersonalizada = document.getElementById('custom-board-button');

    const btnCrearTablero = document.getElementById('create-board');

    document.addEventListener('click', async (e) => {

        // popup de creación de tablero
        if (e.target.closest('#crearTablero')) {
            overlay.classList.add('activo');
        
        // cerrar popups
        } else if (e.target.closest('.btn-cerrar')) {
            overlay.classList.remove('activo');
            creacionPersonalizada.classList.remove('activo');

        } else if (e.target === overlay) {
            overlay.classList.remove('activo');
        
        } else if (e.target === creacionPersonalizada) {
            creacionPersonalizada.classList.remove('activo');
        
        } else if (e.target.closest('#create-board')) {

            let form = document.querySelector(".new-board-name");
            let nombre = form.value.trim();

            const tablero = await insertarTableroEnDB(nombre);

            if (!tablero) console.error("no se ha podido crear el tablero");
            else insertarTableroEnHTML(nombre);

            creacionPersonalizada.classList.remove('activo');
            form.value = '';
        }
    });

    btnCreacionRapida.addEventListener('click', () => {
        overlay.classList.remove('activo');
        creacionPersonalizada.classList.add('activo');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.classList.remove('activo');
        if (e.key === 'Escape') creacionPersonalizada.classList.remove('activo');
    });
});
