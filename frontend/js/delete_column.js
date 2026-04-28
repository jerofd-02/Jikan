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
    if (!confirm("¿Seguro que quieres eliminar esta columna?")) return;

    try {
        const response = await fetch(`http://localhost:3000/columns/${columnId}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Error al eliminar la columna");

        const col = document.querySelector(`.column[data-column-id="${columnId}"]`);
        col.closest(".tasks-section").remove();

    } catch (error) {
        console.error("Error al eliminar la columna:", error);
    }
};