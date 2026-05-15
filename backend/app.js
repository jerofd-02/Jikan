const express = require("express");
const cors = require('cors');
const cookieParser = require('cookie-parser');

const pool = require("./config/database");
const app = express();
const cron = require('node-cron');

app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const boardRoutes = require('./endpoints/board');
const taskRoutes = require('./endpoints/task');
const columnRoutes = require('./endpoints/column');
const authRoutes = require('./endpoints/auth');
const usersRouter = require('./endpoints/users');
const gamifiedBoardRouter = require('./endpoints/gamifiedBoard');
const tasksLogsRouter = require('./endpoints/tasksLogs');

app.use('/boards', boardRoutes);
app.use('/tasks', taskRoutes);
app.use('/columns', columnRoutes);
app.use('/auth', authRoutes);
app.use('/api/users', usersRouter);
app.use('/boards/gamified', gamifiedBoardRouter);
app.use('/tasks/logs', tasksLogsRouter);


cron.schedule('0 0 * * *', async () => {

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const checkDate = yesterday.toISOString().split('T')[0];

    try {
        const [boards] = await pool.query('SELECT * FROM gamified_board');

        for (const board of boards) {

            try {
                const [[{ completed }]] = await pool.query(
                    `SELECT COUNT(*) AS completed 
                     FROM tasks_logs 
                     WHERE board_id = ? AND log_date = ?`,
                    [board.id_board, checkDate]
                );

                if (completed < board.daily_tasks) {
                    await pool.query(
                        `UPDATE gamified_board 
                         SET current_streak = 0 
                         WHERE id_board = ?`,
                        [board.id_board]
                    );
                }

                const [[firstColumn]] = await pool.query(
                    `SELECT id_column 
                     FROM board_column 
                     WHERE id_board = ? 
                     ORDER BY id_column ASC 
                     LIMIT 1`,
                    [board.id_board]
                );

                const [columns] = await pool.query(
                    `SELECT id_column FROM board_column WHERE id_board = ?`,
                    [board.id_board]
                );

                const columnIds = columns.map(c => c.id_column);

                await pool.query(
                    `UPDATE column_task 
                     SET id_column = ? 
                     WHERE id_column IN (?)`,
                    [firstColumn.id_column, columnIds]
                );

            } catch (boardError) {
                console.error(`Error procesando tablero ${board.id_board}:`, boardError);
            }
        }

    } catch (error) {
        console.error('Error en el cron de rachas:', error);
    }
});


async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('Conectado a MySQL');
        conn.release();
    } catch (error) {
        console.error('Error al conectar con MySQL:', error.message);
    }
}

app.get("/", (req, res) => {
    res.send("Backend funcionando");
});

app.listen(3000, () => {
    console.log("Servidor en puerto 3000");
    testConnection();
});