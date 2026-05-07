import Swal from '/node_modules/sweetalert2/dist/sweetalert2.esm.all.min.js';

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("column-menu-btn")) {
        const dropdown = e.target.nextElementSibling;
        const isOpen = !dropdown.classList.contains("hidden");

        // Cierra todos primero
        document.querySelectorAll(".column-dropdown").forEach(d => d.classList.add("hidden"));
        document.querySelectorAll(".column-menu-btn").forEach(btn => btn.classList.remove("active"));

        // Si estaba cerrado, ábrelo; si estaba abierto, déjalo cerrado
        if (!isOpen) {
            dropdown.classList.remove("hidden");
            e.target.classList.add("active");
        }

        return;
    }

    document.querySelectorAll(".column-menu-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".column-dropdown").forEach(d => {
        if (!d.contains(e.target)) d.classList.add("hidden");
    });

    if (e.target.classList.contains("delete-column-btn")) {
        const columnId = e.target.dataset.columnId;
        eliminarColumna(columnId);
    }
});

const eliminarColumna = async (columnId) => {
    const col = document.querySelector(`.column[data-column-id="${columnId}"]`);
    const columnName = col?.querySelector(".editable-title")?.textContent.trim();

    const { isConfirmed } = await Swal.fire({
        customClass: { popup: 'swal-custom-popup swal-custom-popup-inverse' },
        title: "¿Eliminar columna?",
        text: `"${columnName}" y todas sus tareas se eliminarán permanentemente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) return;

    const tasksSection = col.closest(".tasks-section");
    const parent = tasksSection.parentNode;
    const nextSibling = tasksSection.nextSibling;

    let currentColumnId = columnId;

    try {
        const [colRes, tasksRes] = await Promise.all([
            fetch(`/api/columns/${columnId}`, {
                credentials: "include"
            }),
            fetch(`/api/columns/${columnId}/tasks`, {
                credentials: "include"
            })
        ]);

        if (!colRes.ok || !tasksRes.ok) {
            throw new Error("No se pudo obtener la información de la columna.");
        }

        const columnData = await colRes.json();
        const tasksData = await tasksRes.json();

        const deleteRes = await fetch(`/api/columns/${columnId}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (!deleteRes.ok) {
            throw new Error("Error al eliminar la columna");
        }

        // Animación
        tasksSection.style.opacity = "0";
        tasksSection.style.transition = "opacity 0.2s";

        setTimeout(() => {
            tasksSection.remove();

            undoManager.add({
                undo: async () => {
                    // 🔹 recrear columna
                    const colRes = await fetch(`/api/columns/`, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id_board: columnData.id_board,
                            name: columnData.name,
                            position: columnData.position,
                        })
                    });

                    const newCol = await colRes.json();
                    currentColumnId = newCol.id_column;

                    tasksSection.querySelectorAll("[data-column-id]").forEach(el => {
                        el.setAttribute("data-column-id", currentColumnId);
                    });

                    // 🔹 recrear tareas
                    const taskElements = tasksSection.querySelectorAll(".task");

                    await Promise.all(tasksData.map(async (task, i) => {
                        const taskRes = await fetch(`/api/tasks/`, {
                            method: "POST",
                            credentials: "include",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                id_column: currentColumnId,
                                name: task.name,
                                description: task.description,
                                date: task.date ? task.date.split('T')[0] : null,
                                labels: task.labels,
                            })
                        });

                        const newTask = await taskRes.json();

                        if (taskElements[i]) {
                            taskElements[i].dataset.taskId = newTask.id_task;
                        }
                    }));

                    tasksSection.style.opacity = "1";
                    parent.insertBefore(tasksSection, nextSibling);
                    hideUndoPopup();
                },

                redo: async () => {
                    await fetch(`/api/columns/${currentColumnId}`, {
                        method: "DELETE",
                        credentials: "include"
                    });

                    tasksSection.remove();
                    showUndoPopup("Columna eliminada.");
                }
            });

            showUndoPopup("Columna eliminada.");
        }, 200);

    } catch (error) {
        console.error("Error al eliminar la columna:", error);

        Swal.fire({
            customClass: { popup: 'swal-custom-popup' },
            title: 'Error',
            text: 'No se pudo eliminar la columna',
            icon: 'error',
        });
    }
};