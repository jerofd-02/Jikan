import Swal from '/node_modules/sweetalert2/dist/sweetalert2.esm.all.min.js';

window.undoManager = new UndoManager();

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

    const parrafo = taskElement.querySelector("p");
    const currentText = parrafo.textContent;

    Swal.fire({
        width: '700px',
        customClass: {
            popup: 'swal-custom-popup'
        },
        title: 'Modificar tarea',
        html: `
            <div class="edit-task-input">
                <div class="edit-task-left">
                    <label for="name">Nombre de la tarea</label>
                    <input type="text" id="name" autocomplete="off">
                    <label for="description">Descripción de la tarea</label>
                    <textarea id="description"></textarea>
                </div>
                <div class="edit-task-right">
                    <label for="category">Categoría</label>
                    <div class="category-row">
                        <select name="category" id="category"></select>
                        <button type="button" id="add-category-btn" title="Nueva categoría">+</button>
                    </div>
                    <label for="date">Fecha de la tarea</label>
                    <input type="date" id="date" autocomplete="off">
                    <label for="deadline">Fecha límite de la tarea</label>
                    <input type="date" id="deadline" autocomplete="off">
                </div>
            </div>
        `,
        didOpen: () => {
            document.getElementById('name').value = currentText;
        },
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        background: getComputedStyle(document.documentElement).getPropertyValue('--background3-color').trim(),
        color: getComputedStyle(document.documentElement).getPropertyValue('--font-color').trim(),
        confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--principal').trim(),
        cancelButtonColor: "#B0000F",
        preConfirm: () => {
            const name = document.getElementById('name').value.trim();
            if (!name) {
                Swal.showValidationMessage('El nombre no puede estar vacío');
                return false;
            }
            return { name };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            saveSwalTask(taskElement, result.value.name);
        }
    });
}

async function saveSwalTask(taskElement, newText) {
    const taskId = taskElement.dataset.taskId;
    const paragraph = taskElement.querySelector("p");
    const previousText = paragraph.textContent;

    try {
        const response = await fetch(`${TASK_API_URL}/${taskId}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name: newText})
        });

        if (!response.ok) throw new Error("Error al guardar");

        paragraph.textContent = newText;

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
        Swal.fire({
            title: 'Error',
            text: 'No se pudo guardar el cambio',
            icon: 'error',
            background: getComputedStyle(document.documentElement).getPropertyValue('--background3-color').trim(),
            color: getComputedStyle(document.documentElement).getPropertyValue('--font-color').trim(),
        });
    }
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
});

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undoManager.undo();
    }

    if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        undoManager.redo();
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