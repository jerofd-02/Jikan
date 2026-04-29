import { cargarColumnas } from './columnsLoader.js';
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

document.addEventListener("DOMContentLoaded", () => {

    const botonesTableros = document.getElementById('boards-buttons');
    const tablero = document.querySelector(".boards-section");
    const titulo = document.getElementById('board-title');

    botonesTableros.addEventListener('click', async (e) => {
        let button = e.target.closest("button");

        let name = button.textContent;

        let boardId = await getData(BASE_URL + `/boards/name/${name}`);
        let boards = await getData(BASE_URL + `/boards/${boardId.board_id}/full`);

        tablero.innerHTML = '';

        cargarColumnas(boards, tablero, titulo);
    });

    console.log("listo rey");
});