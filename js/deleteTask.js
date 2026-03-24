document.addEventListener("DOMContentLoaded", () => {
    addDeleteButtons();
    
    const observer = new MutationObserver(() => {
        addDeleteButtons();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

function addDeleteButtons() {
    const tasks = document.querySelectorAll(".task");

    tasks.forEach(task => {

        if (task.querySelector(".delete-task")) return;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-task");
        deleteBtn.textContent = "🗑️";

        task.appendChild(deleteBtn);
    });
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-task");

    if (btn) {
        const task = btn.closest(".task");
        deleteTask(task);
    }
});

function deleteTask(taskElement) {
    if (!taskElement) return;

    taskElement.style.opacity = "0";
    taskElement.style.transition = "opacity 0.2s";

    setTimeout(() => {
        taskElement.remove();
    }, 200);
}