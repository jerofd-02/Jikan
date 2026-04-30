import { cargarColumnas } from './columnsLoader.js';
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
            const contenedor = botonBorrar.closest('div');

            let nombre = contenedor.querySelector('button').textContent.trim();

            const tablero = await getData(`${BASE_URL}/boards/name/${nombre}`);
            const boardId = tablero.board_id;

            const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este tablero?');

            if (confirmDelete) {
                try {
                    contenedor.remove();
                    await borrarTableroEnDB(boardId);
                    window.location.reload();
                } catch (error) {
                    alert('No se pudo eliminar el tablero');
                }
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