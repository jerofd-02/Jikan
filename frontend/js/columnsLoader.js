import { tituloEditable } from './add_column.js';
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

let tablero = document.querySelector(".boards-section");

// la función eventualmente tendrá un parámetro que será el id del tablero

export const cargarColumnas = async(boards, tablero, titulo) => {

    titulo.textContent = boards.name;

    tablero.dataset.boardId = boards.board_id;
    for (const column of boards.columns) {

        let taskSection = document.createElement("div");
        taskSection.className = "tasks-section";

        let col = document.createElement("div");
        col.className = "column";
        col.dataset.columnId = column.column_id;

        let colHeader = document.createElement("div");
        colHeader.className = "column-header";

        let title = document.createElement("h3");
        title.textContent = column.name;
        title.classList.add("editable-title");
        tituloEditable(title, column.column_id);

        let menuBtn = document.createElement("button");
        menuBtn.className = "column-menu-btn";
        menuBtn.textContent = "⋯";

        const dropdown = await loadTemplate("dropdown-column");
        dropdown.querySelector(".delete-column-btn").dataset.columnId = column.column_id;

        colHeader.appendChild(title);
        colHeader.appendChild(menuBtn);
        colHeader.appendChild(dropdown);
        col.appendChild(colHeader);

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
        let addbutton = document.createElement("button");
        addbutton.innerText = "+ Añade otra tarea";

        addSection.appendChild(addbutton);
        col.appendChild(addSection);

        taskSection.appendChild(col);
        tablero.appendChild(taskSection);
    };

    let newBoardbutton = document.createElement("button");
    newBoardbutton.className = "create-new-column";
    newBoardbutton.textContent = "Crear nueva columna";

    tablero.appendChild(newBoardbutton);
};

const init = async () => {
    const boardId = localStorage.getItem("boardId");
    let boards = await getData(BASE_URL + `/boards/${boardId}/full`);

    let tablero = document.querySelector(".boards-section");
    let titulo = document.getElementById('board-title');
    await cargarColumnas(boards, tablero, titulo);

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

            await fetch(`${BASE_URL}/tasks/${taskId}`, {
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