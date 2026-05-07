// logout.js

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector("button.logout");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include"
            }).then(response => {
                if (!response.ok) {
                    console.error("Error al cerrar sesión");
                }

                localStorage.clear();
                
                // Redirigir al login (ajusta la ruta según tu proyecto)
                window.location.href = "../html/login.html";
            }).catch(error => {
                console.error("Error al cerrar sesión", error);
            });
        });
    }
});