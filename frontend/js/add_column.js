const añadirColumna = async (boardId, tablero) => {
    const nombreGenerico = "Nueva Columna";

    try {
        const response = await fetch(`http://localhost:3000/boards/${boardId}/columns`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nombreGenerico })
        });

        if (!response.ok) throw new Error("Error al crear la columna");

        const data = await response.json();

        const botonNuevaColumna = tablero.querySelector(".create-new-column");

        let taskSection = document.createElement("div");
        taskSection.className = "tasks-section";

        let col = document.createElement("div");
        col.className = "column";
        col.dataset.columnId = data.column_id; 

        let colHeader = document.createElement("div");
        colHeader.className = "column-header";

        let title = document.createElement("h3");
        title.textContent = data.name;
        title.classList.add("editable-title");
        tituloEditable(title, data.column_id);

        let menuBtn = document.createElement("button");
        menuBtn.className = "column-menu-btn";
        menuBtn.textContent = "⋯";

        const dropdown = await loadTemplate("dropdown-column");
        dropdown.querySelector(".delete-column-btn").dataset.columnId = data.column_id;

        colHeader.appendChild(title);
        colHeader.appendChild(menuBtn);
        colHeader.appendChild(dropdown);
        col.appendChild(colHeader);

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

export const tituloEditable = (titleElement, columnId) => {
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
                await fetch(`http://localhost:3000/columns/${columnId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: nuevoNombre })
                });
            } catch (error) {
                console.error("Error al renombrar columna:", error);
            }

            titleElement.textContent = nuevoNombre;
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


document.addEventListener("click", (e) => {
    if (e.target.classList.contains("create-new-column")) {
        const tablero = e.target.closest(".boards-section");
        const boardId = tablero.dataset.boardId;
        añadirColumna(boardId, tablero);
    }
});