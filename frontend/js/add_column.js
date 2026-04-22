const añadirColumna = async (boardId, tablero) => {
    const nombre = prompt("Nombre de la nueva columna:");
    if (!nombre) return;

    try {
        const response = await fetch(`http://localhost:3000/boards/${boardId}/columns`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nombre })
        });

        if (!response.ok) throw new Error("Error al crear la columna");

        const data = await response.json();

        const botonNuevaColumna = tablero.querySelector(".create-new-column");

        let taskSection = document.createElement("div");
        taskSection.className = "tasks-section";

        let col = document.createElement("div");
        col.className = "column";
        col.dataset.columnId = data.column_id; 

        let title = document.createElement("h3");
        title.textContent = data.name;
        col.appendChild(title);

        let tasks = document.createElement("div");
        tasks.className = "task-list";
        tasks.dataset.columnId = data.column_id;
        col.appendChild(tasks);

        let addSection = document.createElement("div");
        addSection.className = "add-task";
        let addbutton = document.createElement("button");
        addbutton.innerText = "+ Añade otra tarea";
        addSection.appendChild(addbutton);
        col.appendChild(addSection);

        taskSection.appendChild(col);
        tablero.insertBefore(taskSection, botonNuevaColumna);

    } catch (error) {
        console.error("Error al crear la columna:", error);
    }
};

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("create-new-column")) {
        const tablero = e.target.closest(".boards-section");
        const boardId = tablero.dataset.boardId;
        añadirColumna(boardId, tablero);
    }
});