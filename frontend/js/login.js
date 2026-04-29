const BASE_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".login").addEventListener("submit", async (e) => {
        e.preventDefault();

        const mail = document.getElementById("email").value.trim();
        const password = document.getElementById("passwd").value;

        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mail, password })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            localStorage.setItem("userMail", data.mail);
            localStorage.setItem("userName", data.name);
            localStorage.setItem("boardId", data.boardId);
            window.location.href = "/index.html";

        } catch (error) {
            console.error("Error al iniciar sesión:", error);
        }
    });
});