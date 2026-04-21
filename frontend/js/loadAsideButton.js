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

const cargarBotonesLaterales = (boards, buttonSection) => {
    boards.forEach((board) => {
        let boardButton = document.createElement("button");
        boardButton.textContent = board.name;
        buttonSection.appendChild(boardButton);
    });

    let newBoardButton = document.createElement("button");
    newBoardButton.innerHTML = '<i class="fas fa-plus"></i>';
    newBoardButton.id = "crearTablero";
    buttonSection.appendChild(newBoardButton);
};

const init = async () => {

    const buttonSection = document.getElementById("boards-buttons");

    let boards = await getData(BASE_URL + '/boards');
    console.log(boards);

    cargarBotonesLaterales(boards, buttonSection)
}

document.addEventListener("DOMContentLoaded", init);