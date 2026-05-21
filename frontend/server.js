const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const PORT = 4200;
const BACKEND_URL = "http://127.0.0.1:3000";

function startServer() {
    const app = express();

    const proxy = createProxyMiddleware({
        target: BACKEND_URL,
        changeOrigin: true,
        cookieDomainRewrite: "127.0.0.1",
        on: {
            proxyReq: (proxyReq, req) => {
                console.log(`[proxy] ${req.method} ${req.url} → ${BACKEND_URL}`);
            },
            error: (err, req, res) => {
                console.error(`[proxy error] ${err.message}`);
                res.status(502).json({ error: err.message });
            },
        },
    });

    app.use("/api", proxy);
    app.use("/uploads", proxy);

    app.use(express.static(path.join(__dirname)));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "index.html"));
    });

    return new Promise((resolve, reject) => {
        const server = app.listen(PORT, "127.0.0.1", () => {
            console.log(`Servidor interno escuchando en http://127.0.0.1:${PORT}`);
            resolve({ server, port: PORT });
        });
        server.on("error", reject);
    });
}

module.exports = { startServer, PORT };