import { undoManager } from './undoManager.js';

function addModifyButton() {
    const tasks = document.querySelectorAll(".task");

    tasks.forEach(task => {
        if (task.querySelector(".modify-task")) return;

        const modifyBtn = document.createElement("button");
        modifyBtn.classList.add("modify-task");
        modifyBtn.innerHTML = `<i class="fa-solid fa-pen" aria-hidden="true"></i>`;

        const actionsDiv = task.querySelector(".task-actions");
        actionsDiv.appendChild(modifyBtn);
    });
}

function modifyTask(taskElement) {
    if (!taskElement) return;
    if (taskElement.querySelector(".edit-task-input")) return;

    const parrafo = taskElement.querySelector("p");
    const currentText = parrafo.textContent;
    parrafo.style.display = "none";

    const editDiv = document.createElement("div");
    editDiv.classList.add("edit-task-input");
    editDiv.innerHTML = `
                <input type="text" value="${currentText}">
                <div>
                    <button class="save-btn">Guardar Cambios</button>
                    <button class="cancel-btn-modify">Cancelar</button>
                </div>
            `;

    taskElement.insertBefore(editDiv, taskElement.querySelector(".task-actions"));
    const input = editDiv.querySelector("input");
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveTask(editDiv);
        }
    });
}

async function saveTask(editDiv) {
    const task = editDiv.closest(".task");
    const newText = editDiv.querySelector("input").value.trim();
    if (!newText) return;

    const taskId = task.dataset.taskId;
    const paragraph = task.querySelector("p");
    const previousText = paragraph.textContent;

    try {
        const response = await fetch(`${TASK_API_URL}/${taskId}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name: newText})
        });

        if (!response.ok) throw new Error("Error al guardar");

        paragraph.textContent = newText;
        paragraph.style.display = "";
        editDiv.remove();

        undoManager.add({
            undo: async () => {
                const res = await fetch(`${TASK_API_URL}/${taskId}`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({name: previousText})
                });
                if (!res.ok) throw new Error("Error al deshacer");
                paragraph.textContent = previousText;
                hideUndoPopup();
            },
            redo: async () => {
                const res = await fetch(`${TASK_API_URL}/${taskId}`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({name: newText})
                });
                if (!res.ok) throw new Error("Error al rehacer");
                paragraph.textContent = newText;
                showUndoPopup();
            }
        });

        showUndoPopup();

    } catch (error) {
        console.error("Error al actualizar la tarea:", error);
        alert("No se pudo guardar el cambio");
    }
}

function cancelEdit(editDiv) {
    const task = editDiv.closest(".task");
    task.querySelector("p").style.display = "";
    editDiv.remove();
}

let undoPopupTimer = null;

function showUndoPopup() {
    const popup = document.getElementById('undo-popup');
    document.getElementById('undo-popup-text').textContent = 'Tarea modificada';
    popup.style.display = 'flex';
    clearTimeout(undoPopupTimer);
    undoPopupTimer = setTimeout(() => hideUndoPopup(), 5000);
}

function hideUndoPopup() {
    document.getElementById('undo-popup').style.display = 'none';
    clearTimeout(undoPopupTimer);
}

document.addEventListener("click", (e) => {
    if (e.target.closest(".modify-task")) {
        const task = e.target.closest(".task");
        modifyTask(task);
    }

    if (e.target.matches(".save-btn")) {
        saveTask(e.target.closest(".edit-task-input"));
    }

    if (e.target.matches(".cancel-btn-modify")) {
        cancelEdit(e.target.closest(".edit-task-input"));
    }
});

document.addEventListener("DOMContentLoaded", () => {
    addModifyButton();

    const observer = new MutationObserver(() => {
        addModifyButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});