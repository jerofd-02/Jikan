document.addEventListener("DOMContentLoaded", () => {
    let listaActual = null;

    document.addEventListener("click", (e) => {

        // CLICK EN "+ Añade otra tarea"
        if (e.target.matches(".add-task button")) {
            const column = e.target.closest(".column");
            listaActual = column.querySelector(".tasks-list");

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
            const inputList = inputDiv.closest(".tasks-list");
            const input = inputDiv.querySelector("input");
            const texto = input.value.trim();
            if (!texto) return;

            const nuevaTarea = document.createElement("div");
            nuevaTarea.classList.add("task");
            nuevaTarea.innerHTML = `<button></button><p>${texto}</p>`;

            inputList.appendChild(nuevaTarea);
            inputDiv.remove();
        }
    });

    // ENTER EN EL INPUT
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const inputDiv = e.target.closest(".new-task-input");
            if (!inputDiv) return;

            const lista = inputDiv.closest(".tasks-list");
            const input = inputDiv.querySelector("input");
            const texto = input.value.trim();
            if (!texto) return;

            const nuevaTarea = document.createElement("div");
            nuevaTarea.classList.add("task");
            nuevaTarea.innerHTML = `<button></button><p>${texto}</p>`;

            lista.appendChild(nuevaTarea);
            inputDiv.remove();
        }
    });
});