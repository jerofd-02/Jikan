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
        col.dataset.columnId = column.column_id; // <-- guardamos el id de la columna

        let title = document.createElement("h3");
        title.textContent = column.name;
        col.appendChild(title);

        let tasks = document.createElement("div");
        tasks.className = "tasks-list";

        column.tasks.forEach((task) => {
            let taskContent = document.createElement("div");
            taskContent.className = "task";
            taskContent.dataset.taskId = task.id_task; // <-- guardamos el id de la tarea

            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.ariaLabel = "Marcar tarea como completada";

            checkbox.addEventListener('click', () => {
                const checked = checkbox.checked;
                checkbox.closest('.task').classList.toggle('done', checked);
            });

            let taskName = document.createElement("p");
            taskName.textContent = task.name;

            taskContent.appendChild(checkbox);
            taskContent.appendChild(taskName);

            tasks.appendChild(taskContent);
        });

        col.appendChild(tasks);

        let addSection = document.createElement("div");
        addSection.className = "add-task";
        let addcheckbox = document.createElement("checkbox");
        addcheckbox.innerText = "+ Añade otra tarea";

        addSection.appendChild(addcheckbox);
        col.appendChild(addSection);

        taskSection.appendChild(col);
        tablero.appendChild(taskSection);
    });

    let newBoardcheckbox = document.createElement("checkbox");
    newBoardcheckbox.className = "create-new-column";
    newBoardcheckbox.textContent = "Crear nueva columna";

    tablero.appendChild(newBoardcheckbox);
};

const init = async () => {
    let boards = await getData(API_URL);
    let tablero = document.querySelector(".boards-section");
    cargarColumnas(boards, tablero);
};

init();