const API_URL = "http://localhost:3000/boards/1/full";

const getData = async (link) => {
    return await fetch(link)
        .catch(error => console.error('Error fetching data:', error))
        .then(response => response.json());
}

let tablero = document.querySelector(".boards-section");

console.log(tablero);

// la función eventualmente tendrá un parámetro que será el id del tablero
const cargarColumnas = (boards, tablero) => {

    boards.columns.forEach((column) => {

        let taskSection = document.createElement("div");
        taskSection.className = "tasks-section";

        let col = document.createElement("div");
        col.className = "column";

        let title = document.createElement("h3");
        title.textContent = column.name;
        col.appendChild(title);

        let tasks = document.createElement("div");
        tasks.className = "tasks-list";

        column.tasks.forEach((task) => {
            let taskContent = document.createElement("div");
            taskContent.className = "task";
            taskContent.draggable = true;

            let button = document.createElement("button");
            button.role = "checkbox";
            button.ariaChecked = false;
            button.ariaLabel = "Marcar tarea como completada";

            button.addEventListener('click', () => {
                const checked = button.getAttribute('aria-checked') === 'true';
                button.setAttribute('aria-checked', String(!checked));
                button.closest('.task').classList.toggle('done', !checked);
            });

            let taskName = document.createElement("p");
            taskName.textContent = task.name;

            taskContent.appendChild(button);
            taskContent.appendChild(taskName);

            tasks.appendChild(taskContent);
        });

        col.appendChild(tasks);

        let addSection = document.createElement("div");
        addSection.className = "add-task";
        let addButton = document.createElement("button");
        addButton.innerText = "+ Añade otra tarea";

        addSection.appendChild(addButton);
        col.appendChild(addSection);

        taskSection.appendChild(col);
        tablero.appendChild(taskSection);
    });

    let newBoardButton = document.createElement("button");
    newBoardButton.className = "create-new-column";
    newBoardButton.textContent = "Crear nueva columna";

    tablero.appendChild(newBoardButton);
};

const init = async () => {
    let boards = await getData(API_URL);
    let tablero = document.querySelector(".boards-section");
    cargarColumnas(boards, tablero);

    let tasks = document.getElementsByClassName('tasks');
    let columns = document.getElementsByClassName('task-list');
    let selected = null;

    for (let task of tasks) {
        task.addEventListener("dragstart", (e) => {
            selected = e.target;
        });
    }

    for (let column of columns) {
        column.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        column.addEventListener("drop", (e) => {
            if (selected) {
                column.appendChild(selected);
                selected = null;
            }
        });
    }
};

init();