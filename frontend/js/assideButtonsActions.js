import { cargarColumnas } from './columnsLoader.js';
import Swal from '/node_modules/sweetalert2/dist/sweetalert2.esm.all.min.js';
const BASE_URL = "/api";

const getData = async (link) => {
    try {
        const response = await fetch(link, { credentials: 'include' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const tituloEditableBoard = (titleElement, boardId) => {
    titleElement.addEventListener("click", () => {
        if (titleElement.querySelector("input")) return;

        const currentText = titleElement.textContent;
        titleElement.textContent = "";

        const input = document.createElement("input");
        input.type = "text";
        input.value = currentText;
        input.maxLength = 50;
        input.classList.add("edit-title-input");
        titleElement.appendChild(input);
        input.focus();
        input.select();

        const guardar = async () => {
            const nuevoNombre = input.value.trim() || currentText;

            try {
                await fetch(`/api/boards/${boardId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: nuevoNombre })
                });
            } catch (error) {
                console.error("Error al renombrar tablero:", error);
            }

            titleElement.textContent = nuevoNombre;

            let botones = document.querySelectorAll('.swap-board-button');
            botones.forEach(boton => {
                if (boton.textContent == currentText) {
                    boton.textContent = nuevoNombre;
                    return;
                }
            });

        };

        input.addEventListener("blur", guardar);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") input.blur();
            if (e.key === "Escape") {
                input.removeEventListener("blur", guardar);
                titleElement.textContent = currentText;
            }
        });
    });
};

const borrarTableroEnDB = async (boardId) => {
    try {
        const response = await fetch(`${BASE_URL}/boards/${boardId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el tablero');
        }

        const result = await response.json();
        console.log(result.message);
        return result;

    } catch (error) {
        console.error(error);
        throw error;
    }
};

document.addEventListener("DOMContentLoaded", () => {

    // movimiento entre tableros

    const botonesTableros = document.getElementById('boards-buttons');
    const tablero = document.querySelector(".boards-section");
    const titulo = document.getElementById('board-title');

    botonesTableros.addEventListener('click', async (e) => {

        // borrar tablero
        const botonBorrar = e.target.closest('.delete-board');
        if (botonBorrar) {
            e.stopPropagation();
            const nombre = botonBorrar.closest('.swap-board-button').textContent.trim();
            console.log('Borrar tablero:', nombre, 'Swal:', typeof Swal); // ← añadir

            const { isConfirmed } = await Swal.fire({
                customClass: { popup: 'swal-custom-popup swal-custom-popup-inverse' },
                title: "¿Eliminar tablero?",
                text: `"${nombre}" y todas sus columnas y tareas se eliminarán permanentemente.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            });

            if (!isConfirmed) return;

            try {
                const tablero = await getData(`${BASE_URL}/boards/name/${nombre}`);
                const boardId = tablero.board_id;
                contenedor.remove();
                await borrarTableroEnDB(boardId);
                window.location.reload();
            } catch (error) {
                Swal.fire({
                    customClass: { popup: 'swal-custom-popup' },
                    title: 'Error',
                    text: 'No se pudo eliminar el tablero',
                    icon: 'error',
                });
            }
        }

        // cambiar de tablero
        const botonTablero = e.target.closest(".swap-board-button");
        if (botonTablero) {

            const name = botonTablero.textContent.trim();
            const boardId = await getData(BASE_URL + `/boards/name/${name}`);
            const boards = await getData(BASE_URL + `/boards/${boardId.board_id}/full`);

            tablero.innerHTML = '';
            cargarColumnas(boards, tablero, titulo);
        }
    });
});