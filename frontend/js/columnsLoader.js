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
        col.dataset.columnId = column.column_id;

        let title = document.createElement("h3");
        title.textContent = column.name;
        col.appendChild(title);

        let tasks = document.createElement("div");
        tasks.className = "task-list";
        tasks.dataset.columnId = column.column_id;

        column.tasks.forEach((task) => {
            let taskContent = document.createElement("div");
            taskContent.className = "task";
            taskContent.dataset.taskId = task.id_task;
            taskContent.draggable = true;

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

    let selected = null;

    tablero.addEventListener("dragstart", (e) => {
        if (e.target.classList.contains("task")) {
            selected = e.target;
        }
    });

    tablero.addEventListener("dragover", (e) => {
        if (e.target.closest(".task-list")) {
            e.preventDefault();
        }
    });

    tablero.addEventListener("drop", async (e) => {
        const targetList = e.target.closest(".task-list");
        if (selected && targetList) {
            const taskId = selected.dataset.taskId;
            const columnId = targetList.dataset.columnId;

            await fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_column: columnId }),
            }).catch(err => console.error("Error actualizando tarea:", err));

            targetList.appendChild(selected);
            selected = null;
        }
    });
};

init();