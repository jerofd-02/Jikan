const express = require('express');
const router = express.Router();

const pool = require("../config/database");
const {handleError} = require("../utils/errors");
const {sendNotFound, verifyToken} = require("../utils/validations");

// GET /tasks/logs/board/:boardId
router.get('/board/:boardId', verifyToken, async (req, res) => {
    try {
        const { boardId } = req.params;
        
        const [rows] = await pool.query(
            `SELECT tl.board_id, tl.task_id, tl.log_date, tl.completed_at, ct.name as task_name
             FROM tasks_logs tl
             JOIN column_task ct ON tl.task_id = ct.id_task
             WHERE tl.board_id = ?
             ORDER BY tl.log_date DESC, tl.completed_at DESC`,
            [boardId]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener los logs de tareas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /tasks/logs/task/:taskId
router.get('/task/:taskId', verifyToken, async (req, res) => {
    try {
        const { taskId } = req.params;
        
        const [rows] = await pool.query(
            `SELECT tl.board_id, tl.task_id, tl.log_date, tl.completed_at
             FROM tasks_logs tl
             WHERE tl.task_id = ?
             ORDER BY tl.log_date DESC, tl.completed_at DESC`,
            [taskId]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener los logs de la tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// POST /tasks/logs
router.post('/', verifyToken, async (req, res) => {
    try {
        const { board_id, task_id } = req.body;

        if (!board_id || !task_id) {
            return res.status(400).json({ 
                message: 'Los parámetros board_id y task_id son requeridos' 
            });
        }

        const [boardExists] = await pool.query(
            `SELECT id_board FROM gamified_board WHERE id_board = ?`,
            [board_id]
        );

        if (boardExists.length === 0) {
            return res.status(404).json({ 
                message: `Tablero gamificado con id ${board_id} no encontrado` 
            });
        }

        const [taskExists] = await pool.query(
            `SELECT id_task FROM column_task WHERE id_task = ?`,
            [task_id]
        );

        if (taskExists.length === 0) {
            return res.status(404).json({ 
                message: `Tarea con id ${task_id} no encontrada` 
            });
        }

        await pool.query(
            `INSERT INTO tasks_logs (board_id, task_id) VALUES (?, ?)`,
            [board_id, task_id]
        );

        res.status(201).json({ 
            message: 'Log de tarea creado exitosamente',
            board_id,
            task_id
        });
    } catch (error) {
        console.error('Error al crear el log de tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;