const TASK_API_URL = "/api/tasks";

document.addEventListener("DOMContentLoaded", () => {
    let listaActual = null;

    document.addEventListener("click", (e) => {
        // CLICK EN "+ Añade otra tarea"
        if (e.target.matches(".add-task button")) {
            const column = e.target.closest(".column");
            listaActual = column.querySelector(".task-list");
            console.log(listaActual);

            // Evitar múltiples inputs
            if (column.querySelector(".new-task-input")) return;

            // Crear el input inline
            const nuevaTareaInput = document.createElement("div");
            nuevaTareaInput.classList.add("new-task-input");

            nuevaTareaInput.innerHTML = `
                <input type="text" placeholder="Escribe la tarea">
                <div>
                    <button class="add-btn">Añadir</button>
                    <button class="cancel-btn">Cancelar</button>
                </div>
            `;

            listaActual.appendChild(nuevaTareaInput);
            nuevaTareaInput.querySelector("input").focus();
        }

        // CLICK EN CANCELAR
        if (e.target.matches(".cancel-btn")) {
            const inputDiv = e.target.closest(".new-task-input");
            if (inputDiv) inputDiv.remove();
        }

        // CLICK EN AÑADIR
        if (e.target.matches(".add-btn")) {
            const inputDiv = e.target.closest(".new-task-input");
            procesarTarea(inputDiv);
        }
    });

    // ENTER EN EL INPUT
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const inputDiv = e.target.closest(".new-task-input");
            if (!inputDiv) return;
            procesarTarea(inputDiv);
        }
    });
});

async function agregarTarea(nombre, columnId, inputDiv) {
    try {
        const response = await fetch(TASK_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_column: columnId, name: nombre }),
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Error al guardar la tarea:", err.message);
            return;
        }

        const data = await response.json();

        // Añadir la tarjeta al DOM solo si el servidor confirmó el guardado
        const lista = inputDiv.closest(".task-list");
        const nuevaTarea = document.createElement("div");
        nuevaTarea.classList.add("task");
        nuevaTarea.dataset.taskId = data.id_task; // guardamos el id devuelto por la BD
        nuevaTarea.innerHTML = `<input type="checkbox"></input><p>${nombre}</p>`;
        nuevaTarea.draggable = true;

        const checkbox = nuevaTarea.querySelector('input')
        checkbox?.addEventListener('click', () => {
            const checked = checkbox.checked;
            checkbox.closest('.task').classList.toggle('done', checked);
        });

        lista.appendChild(nuevaTarea);
        inputDiv.remove();

    } catch (error) {
        console.error("Error de red al crear la tarea:", error);
    }
}

async function procesarTarea(inputDiv) {
    if (!inputDiv) return;

    const input = inputDiv.querySelector("input");
    const texto = input.value.trim();
    if (!texto) return;

    const column = inputDiv.closest(".column");
    const columnId = column.dataset.columnId;

    agregarTarea(texto, columnId, inputDiv);
}