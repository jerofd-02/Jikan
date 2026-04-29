const express = require("express");
const cors = require('cors');

const pool = require("./config/database");
const app = express();

app.use(cors());
app.use(express.json());

const boardRoutes = require('./endpoints/board');
const taskRoutes  = require('./endpoints/task');
const columnRoutes = require('./endpoints/column');
const authRoutes = require('./endpoints/auth');

app.use('/boards', boardRoutes);
app.use('/tasks',  taskRoutes);
app.use('/columns', columnRoutes);
app.use('/auth', authRoutes);

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