const BASE_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
    const deleteBtn = document.querySelector("button.delete-account");
    if (!deleteBtn) return;

    deleteBtn.addEventListener("click", async () => {
        const userName = localStorage.getItem("userName") || "tu cuenta";

        const { isConfirmed } = await Swal.fire({
            title: "¿Eliminar cuenta?",
            text: `"${userName}" se eliminará permanentemente y no podrás recuperarla.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",

            background: getComputedStyle(document.documentElement).getPropertyValue("--background3-color").trim(),
            color: getComputedStyle(document.documentElement).getPropertyValue("--font-color").trim(),

            confirmButtonColor: "#B0000F",
            cancelButtonColor: getComputedStyle(document.documentElement).getPropertyValue("--principal").trim(),
        });

        if (!isConfirmed) return;

        try {
            const response = await fetch(`${BASE_URL}/auth/delete-account`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json();
                await Swal.fire({
                    title: "Error",
                    text: data.message || "No se pudo eliminar la cuenta.",
                    icon: "error",
                    background: getComputedStyle(document.documentElement).getPropertyValue("--background3-color").trim(),
                    color: getComputedStyle(document.documentElement).getPropertyValue("--font-color").trim(),
                    confirmButtonColor: "#B0000F",
                });
                return;
            }

            localStorage.clear();
            window.location.href = "/html/login.html";

        } catch (error) {
            console.error("Error al eliminar la cuenta:", error);
        }
    });
});