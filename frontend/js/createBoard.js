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

    let contenedor = document.createElement('div');

    let boardButton = document.createElement("button");
    boardButton.textContent = nombre;
    boardButton.className = 'swap-board-button';
    contenedor.appendChild(boardButton);

    let deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-board");
    deleteBtn.innerHTML = `<i class="fa fa-trash" aria-hidden="true"></i>`;
    contenedor.appendChild(deleteBtn);

    seccionBotones.insertBefore(contenedor, botones[botones.length - 1]);
};

const insertarTableroBasicoEnDB = async (name, columnsNames) => {
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

        let defaultColumns = [];

        if (columnsNames.length == 0) {
            defaultColumns = ['Por hacer', 'En progreso', 'Terminado'];
        } else {
            defaultColumns = columnsNames;
        }

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
    const creacionRapida = document.getElementById('fast-creation-popup');
    const creacionPersonalizada = document.getElementById('custom-creation-popup');
    const confirmarCustom = document.getElementById('custom-creation-confiramtion');

    const btnCreacionRapida = document.getElementById('fast-board-button');
    const btnCreacionPersonalizada = document.getElementById('custom-board-button');

    document.addEventListener('click', async (e) => {

        // popup de creación de tablero
        if (e.target.closest('#crearTablero')) {
            overlay.classList.add('activo');
        
        // cerrar popups
        } else if (e.target.closest('.btn-cerrar')) {
            overlay.classList.remove('activo');
            creacionRapida.classList.remove('activo');
            creacionPersonalizada.classList.remove('activo');
            confirmarCustom.classList.remove('activo');
        
        } else if (e.target.closest('.cancel-creation-button')) {
            overlay.classList.remove('activo');
            creacionRapida.classList.remove('activo');
            creacionPersonalizada.classList.remove('activo');
            confirmarCustom.classList.remove('activo');
        

        // segundo modal para creación personalizada de tableros
        } else if (e.target.closest('.continue-board-button')) {
            let numColumns = document.getElementById('numberFLD').value;
            const formSection = document.getElementById('column-names-div');

            creacionPersonalizada.classList.remove('activo');
            confirmarCustom.classList.add('activo');
            
            for(let i = 0; i < numColumns; i++) {
                const container = document.createElement('div');

                container.innerHTML = `
                    <h3>Introduce el nombre de la ${i + 1}ª columna</h3>
                    <form role="input" class="popup-form">
                        <label></label>
                        <input type="text" class="new-board-name" placeholder="Mi columna...">
                    </form>
                `;

                formSection.appendChild(container);
            }
        
        // boton para volver atrás en creación personalizada de tablero
        } else if (e.target.closest('.back-creation-button')) {
            confirmarCustom.classList.remove('activo');
            creacionPersonalizada.classList.add('activo');

            document.getElementById('column-names-div').innerHTML = '';
            
        
        } else if (e.target === overlay) {
            overlay.classList.remove('activo');
        
        } else if (e.target === creacionRapida) {
            creacionRapida.classList.remove('activo');

        } else if (e.target === creacionPersonalizada) {
            creacionPersonalizada.classList.remove('activo');
        
        } else if (e.target === confirmarCustom) {
            confirmarCustom.classList.remove('activo');
            document.getElementById('column-names-div').innerHTML = '';
        
        } else if (e.target.closest('.create-board-button')) {

            if (creacionRapida.classList.contains('activo')) {
                let form = document.querySelector(".fast-board-name");
                let nombre = form.value.trim();

                const tablero = await insertarTableroBasicoEnDB(nombre, []);

                if (!tablero) console.error("no se ha podido crear el tablero");
                else insertarTableroEnHTML(nombre);
                form.value = '';

            } else {
                let form = document.querySelector(".custom-board-name");
                let nombre = form.value.trim();

                let nombresColumnas = Array.from(document.querySelectorAll('.new-board-name'))
                    .map(col => col.value.trim())
                    .filter(val => val !== "");

                const tablero = await insertarTableroBasicoEnDB(nombre, nombresColumnas);

                if (!tablero) console.error("no se ha podido crear el tablero");
                else insertarTableroEnHTML(nombre);

                form.value = '';
                document.getElementById('column-names-div').innerHTML = '';
            }

            creacionRapida.classList.remove('activo');
            creacionPersonalizada.classList.remove('activo');
            confirmarCustom.classList.remove('activo');
        }
    });

    btnCreacionRapida.addEventListener('click', () => {
        overlay.classList.remove('activo');
        creacionPersonalizada.classList.remove('activo');
        confirmarCustom.classList.remove('activo');
        creacionRapida.classList.add('activo');
    });

    btnCreacionPersonalizada.addEventListener('click', () => {
        overlay.classList.remove('activo');
        creacionRapida.classList.remove('activo');
        confirmarCustom.classList.remove('activo');
        creacionPersonalizada.classList.add('activo');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.classList.remove('activo');
        if (e.key === 'Escape') creacionRapida.classList.remove('activo');
        if (e.key === 'Escape') creacionPersonalizada.classList.remove('activo');
        if (e.key === 'Escape') confirmarCustom.classList.remove('activo');
    });
});
