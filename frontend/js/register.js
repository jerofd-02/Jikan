const BASE_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".register").addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("username").value.trim();
        const mail = document.getElementById("email").value.trim();
        const password = document.getElementById("passwd").value;
        const confirmPassword = document.getElementById("repeat-password").value;

        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, mail, password })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("userMail", data.mail);
            localStorage.setItem("userName", data.name);
            localStorage.setItem("boardId", data.boardId);
            window.location.href = "/index.html";

        } catch (error) {
            console.error("Error al registrarse:", error);
        }
    });
});