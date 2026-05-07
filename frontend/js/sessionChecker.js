window.addEventListener("load", async () => {
    try {
        const response = await fetch("/api/auth/verify", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            localStorage.clear();
            window.location.href = "./html/login.html";
            return;
        }
    } catch (error) {
        console.error("Error al verificar sesión:", error);
        localStorage.clear();
        window.location.href = "./html/login.html";
    }
});