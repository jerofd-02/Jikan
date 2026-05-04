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
    }

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
            body: JSON.stringify({name})
        });

        if (!boardres.ok) {
            throw new Error('Error al crear el tablero');
        }

        const board = await boardres.json();
        const boardId = board.board_id;

        let defaultColumns = columnsNames.length === 0
            ? ['Por hacer', 'En progreso', 'Terminado']
            : columnsNames

        await Promise.all(defaultColumns.map(colName =>
            fetch(`${BASE_URL}/boards/${boardId}/columns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name: colName})
            })
        ));

        return board;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

async function showPopupCreateBoard() {
    const {value: modo} = await Swal.fire({
        title: 'Organiza tus ideas',
        customClass: {popup: 'swal-custom-popup'},
        html: `
            <p class="swal-subtitle">¿Cómo deseas crear un nuevo tablero?</p>
            <div class="swal-mode-buttons">
            <button id="swal-rapida" class="swal2-confirm swal2-styled">Creación rápida</button>
            <button id="swal-personalizada" class="swal2-confirm swal2-styled swal2-btn-secondary">
                Creación personalizada
            </button> 
            </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            document.getElementById('swal-rapida').addEventListener('click', () => {
                Swal.getPopup().__modo = 'rapida';
                Swal.clickConfirm();
            });
            document.getElementById('swal-personalizada').addEventListener('click', () => {
                Swal.getPopup().__modo = 'personalizada';
                Swal.clickConfirm();
            });
        },
        preConfirm: () => Swal.getPopup().__modo ?? null,
    });

    if (!modo) return;
    if (modo === 'rapida') await fastCreation();
    else await customCreation();

    let botones = document.querySelectorAll('.swap-board-button');
    let boton = botones[botones.length - 1];
    boton.click();
}

async function fastCreation() {
    const {value: name} = await Swal.fire({
        title: 'Creación rápida del tablero',
        customClass: {popup: 'swal-custom-popup'},
        html: `
            <label for="swal-nombre" class="swal-label">Nombre del tablero</label>
            <input id="swal-nombre" class="swal2-input" placeholder="Tablero de..." autocomplete="off">
        `,
        showCancelButton: true,
        confirmButtonText: 'Crear tablero',
        cancelButtonText: 'Cancelar',
        didOpen: () => document.getElementById('swal-nombre').focus(),
        preConfirm: () => {
            const name = document.getElementById('swal-nombre').value.trim();
            if (!name) {
                Swal.showValidationMessage('El nombre no puede estar vacío.');
                return false;
            }
            return name;
        }
    });

    if (!name) return;

    try {
        const board = await insertarTableroBasicoEnDB(name, []);
        if (board) insertarTableroEnHTML(name);
    } catch {
        Swal.fire({
            title: 'Error',
            text: 'No se pudo crear el tablero',
            icon: 'error',
            customClass: {popup: 'swal-custom-popup'},
        });
    }
}

async function customCreation() {
    const step1 = await Swal.fire({
        title: 'Creación personalizada del tablero',
        customClass: {popup: 'swal-custom-popup'},
        html: `
            <label for="swal-name" class="swal-label">Nombre de tablero</label>
            <input id="swal-name" class="swal2-input" placeholder="Tablero de..." autocomplete="off">
            <label class="swal-label-spaced">¿Cuántas columnas deseas?</label>
            <div class="swal-stepper">
                <button type="button" id="sub-button" class="swal-button swal2-confirm swal2-styled">-</button>
                <input id="swal-ncols" type="number" min="2" max="5" value="3" readonly>
                <button type="button" id="add-button" class="swal-button swal2-confirm swal2-styled">+</button>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            document.getElementById('swal-name').focus();
            const input = document.getElementById('swal-ncols');
            document.getElementById('sub-button').addEventListener('click', () => {
                if (parseInt(input.value) > 2) input.value = parseInt(input.value) - 1;
            });
            document.getElementById('add-button').addEventListener('click', () => {
                if (parseInt(input.value) < 5) input.value = parseInt(input.value) + 1;
            });
        }, preConfirm: () => {
            const name = document.getElementById('swal-name').value.trim();
            if (!name) {
                Swal.showValidationMessage("El nombre no puede estar vacío");
                return false;
            }
            return {name, ncols: parseInt(document.getElementById('swal-ncols').value)};
        }
    });

    if (!step1.isConfirmed) return;

    const {name, ncols} = step1.value;

    const colInputs = Array.from({length: ncols}).map((_, i) =>
        `
            <label class="${i ? 'swal-label-spaced' : 'swal-label'}">Nombre de la ${i + 1}º columna</label>
            <input id="swal-col-${i}" class="swal2-input" placeholder="Columna de..." autocomplete="off">
        `).join('');

    const step2 = await Swal.fire({
        title: 'Creación personalizada de tablero',
        customClass: {popup: 'swal-custom-popup'},
        html: colInputs,
        showCancelButton: true,
        confirmButtonText: 'Crear tablero',
        cancelButtonText: 'Atrás',
        didOpen: () => document.getElementById('swal-col-0').focus(),
        preConfirm: () => {
            const cols = Array.from({length: ncols}).map((_, i) =>
                document.getElementById(`swal-col-${i}`).value.trim()
            ).filter(Boolean);

            if (cols.length < ncols) {
                Swal.showValidationMessage('Rellena todos los nombre de columna');
                return false;
            }
            return cols;
        }
    })

    if (step2.isDismissed && step2.dismiss == Swal.DismissReason.cancel) {
        await customCreation();
        return;
    }

    if (!step2.isConfirmed) return;

    try {
        const board = await insertarTableroBasicoEnDB(name, step2.value);
        if (board) insertarTableroEnHTML(name);
    } catch {
        Swal.fire({
            title: 'Error',
            text: 'No se pudo crear el tablero',
            icon: 'error',
            customClass: {popup: 'swal-custom-popup'},
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        if (e.target.closest('#crearTablero')) showPopupCreateBoard();
    });
});