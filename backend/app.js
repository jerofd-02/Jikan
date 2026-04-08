const express = require("express");
const mysql = require("mysql2");
const cors = require('cors');

const app = express();
app.use(cors());

const boardRoutes = require('./endpoints/board');
app.use('/boards', boardRoutes);



function createConnection() {
    return mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
}

let connection;
function connectWithRetry(retries = 10, delay = 2000) {
    connection = createConnection();
    connection.connect(err => {
        if (err) {
            console.error("Error conectando:", err);
            if (retries > 0) {
                console.log(`Reintentando conexión en ${delay}ms... (${retries} intentos restantes)`);
                setTimeout(() => connectWithRetry(retries - 1, delay), delay);
            } else {
                console.error("No se pudo conectar a MySQL tras varios intentos.");
            }
        } else {
            console.log("Conectado a MySQL");
        }
    });
}

connectWithRetry();

app.get("/", (req, res) => {
    res.send("Backend funcionando");
});

app.listen(3000, () => {
    console.log("Servidor en puerto 3000");
});