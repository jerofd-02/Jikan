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

async function deleteTask(taskElement) {
    if (!taskElement) return;

    const taskId = taskElement.dataset.taskId;

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
        }, 200);
    } catch (error) {
        console.error("Error en la petición: ", error);
    }
}