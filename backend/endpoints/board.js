const express = require('express');
const router = express.Router();

const pool = require("../config/database");
const { handleError } = require("../utils/errors");
const { sendNotFound } = require("../utils/validations");

// GET /boards
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM board`);
        res.status(200).json(rows);
    } catch (error) {
        handleError(res, error, 'obtener todos los boards');
    }
});

// GET /boards/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`SELECT * FROM board WHERE board_id = ?`, [id]);

        if (rows.length === 0) return sendNotFound(res, 'Board', id);

        res.status(200).json(rows[0]);
    } catch (error) {
        handleError(res, error, 'obtener board por id');
    }
});

// GET /boards/:id/full
router.get('/:id/full', async (req, res) => {
    try {
        const { id } = req.params;

        const [boardRows] = await pool.query(`SELECT * FROM board WHERE board_id = ?`, [id]);
        if (boardRows.length === 0) return sendNotFound(res, 'Board', id);

        const [columnRows] = await pool.query(`
            SELECT c.column_id, c.name
            FROM columns_table c
                     INNER JOIN board_column bc ON c.column_id = bc.id_column
            WHERE bc.id_board = ?
        `, [id]);

        const columnsWithTasks = await Promise.all(columnRows.map(async (column) => {
            const [taskRows] = await pool.query(`
                SELECT t.id_task, t.name, t.description, t.date
                FROM column_task t
                WHERE t.id_column = ?
            `, [column.column_id]);

            return { ...column, tasks: taskRows };
        }));

        res.status(200).json({ ...boardRows[0], columns: columnsWithTasks });
    } catch (error) {
        handleError(res, error, 'obtener board completo');
    }
});

module.exports = router;