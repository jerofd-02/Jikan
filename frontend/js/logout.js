// logout.js

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector("button.logout");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // Eliminar el usuario guardado en localStorage
            localStorage.clear();

            // Redirigir al login (ajusta la ruta según tu proyecto)
            window.location.href = "../html/login.html";
        });
    }
});