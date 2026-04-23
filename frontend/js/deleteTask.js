import Swal from '/node_modules/sweetalert2/dist/sweetalert2.esm.all.min.js';

window.undoManager = new UndoManager();
window.hideUndoPopup = hideUndoPopup;

document.addEventListener("DOMContentLoaded", () => {
    addDeleteButtons();

    const observer = new MutationObserver(() => {
        addDeleteButtons();
    });

    observer.observe(document.body, {
        childList: true, subtree: true
    });
});

function addDeleteButtons() {
    const tasks = document.querySelectorAll(".task");

    tasks.forEach(task => {
        if (task.querySelector(".task-actions")) return;

        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("task-actions");
        task.appendChild(actionsDiv);

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-task");
        deleteBtn.innerHTML = `<i class="fa fa-trash" aria-hidden="true"></i>`;

        actionsDiv.appendChild(deleteBtn);
    });
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-task");

    if (btn) {
        const task = btn.closest(".task");
        deleteTask(task);
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
})

async function deleteTask(taskElement) {
    if (!taskElement) return;

    const taskName = taskElement.querySelector("p")?.textContent.trim();

    const {isConfirmed} = await Swal.fire({
        title: "¿Eliminar tarea?",
        text: `"${taskName}" se eliminará permanentemente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',

        background: getComputedStyle(document.documentElement).getPropertyValue('--background3-color').trim(),
        color: getComputedStyle(document.documentElement).getPropertyValue('--font-color').trim(),

        confirmButtonColor: "#B0000F",
        cancelButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--principal').trim(),
    });

    if (!isConfirmed) return;

    let taskId = taskElement.dataset.taskId;
    const parent = taskElement.parentNode;
    const nextSibling = taskElement.nextSibling;

    const taskData = await fetch(`http://localhost:3000/tasks/${taskId}`).then(r => r.json());

    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            console.error("Error al eliminar la tarea.");
            return;
        }

        taskElement.style.opacity = "0";
        taskElement.style.transition = "opacity 0.2s";
        setTimeout(() => {
            taskElement.remove();

            undoManager.add({
                undo: async () => {
                    const date = taskData.date ? taskData.date.split('T')[0] : null;

                    const res = await fetch(`http://localhost:3000/tasks/`, {
                        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({
                            id_column: taskData.id_column,
                            name: taskData.name,
                            description: taskData.description,
                            date: date,
                            labels: taskData.labels
                        })
                    });
                    const data = await res.json();
                    taskElement.dataset.taskId = data.id_task
                    taskId = data.id_task;
                    parent.insertBefore(taskElement, nextSibling);
                    taskElement.style.opacity = "1";
                    hideUndoPopup();
                }, redo: async () => {
                    await fetch(`http://localhost:3000/tasks/${taskId}`, {method: "DELETE"});
                    taskElement.remove();
                    showUndoPopup();
                }
            });
            showUndoPopup();
        }, 200);
    } catch (error) {
        console.error("Error en la petición: ", error);
    }
}

let undoPopupTimer = null;

function showUndoPopup() {
    const popup = document.getElementById('undo-popup');
    popup.style.display = 'flex';
    clearTimeout(undoPopupTimer);
    undoPopupTimer = setTimeout(() => hideUndoPopup(), 5000);
}

function hideUndoPopup() {
    document.getElementById('undo-popup').style.display = 'none';
    clearTimeout(undoPopupTimer);
}