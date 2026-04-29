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
    const userMail = localStorage.getItem("userMail");

    let boards = await getData(`${BASE_URL}/boards/user/${userMail}`);
    cargarBotonesLaterales(boards, buttonSection);

    //Tambien modificar nombre y email
    const userName = localStorage.getItem("userName");

    if (userMail) {
        document.querySelector(".user-name-asside").textContent = userName;
        document.querySelector(".user-email-asside").textContent = userMail;
        document.querySelector(".user-picture").parentElement.href = "./html/user-profile.html";
        console.log("Usuario autenticado:", userMail);
    }
};

document.addEventListener("DOMContentLoaded", init);