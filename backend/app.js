const express = require("express");
const cors = require('cors');
const cookieParser = require('cookie-parser');

const pool = require("./config/database");
const app = express();

app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

//Añadido para el upload de imágenes-----------------------------------
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//---------------------------------------------------------------------

const boardRoutes = require('./endpoints/board');
const taskRoutes = require('./endpoints/task');
const columnRoutes = require('./endpoints/column');
const authRoutes = require('./endpoints/auth');
const usersRouter = require('./endpoints/users');
const invitationsRouter = require('./endpoints/invitations');

app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRouter);
app.use('/api/invitations', invitationsRouter);

async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('✓ Conectado a MySQL');
        conn.release();
    } catch (error) {
        console.error('✗ Error al conectar con MySQL:', error.message);
    }
}

app.get("/", (req, res) => {
    res.send("Backend funcionando");
});

app.listen(3000, () => {
    console.log("Servidor en puerto 3000");
    testConnection();
});