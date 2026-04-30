const express = require('express');
const router = express.Router();

const pool = require("../config/database");
const { handleError } = require("../utils/errors");
const { sendNotFound,verifyToken } = require("../utils/validations");

// GET /boards/user/:mail
router.get('/user/:mail', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.board_id, b.name
            FROM board b
            INNER JOIN users_board ub ON b.board_id = ub.board_id
            WHERE ub.user_id = ?
        `, [req.user.id]);

        res.status(200).json(rows);
    } catch (error) {
        handleError(res, error, 'obtener tableros del usuario');
    }
});

// GET /boards/:id/full
router.get('/:id/full', verifyToken, async (req, res) => {
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

// POST /boards
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'El nombre del board es obligatorio' });
        }

        const [result] = await pool.query(
            `INSERT INTO board (name) VALUES (?)`,
            [name]
        );

        res.status(201).json({
            board_id: result.insertId,
            name
        });

    } catch (error) {
        handleError(res, error, 'crear board');
    }
});

// POST /boards/:id/columns
router.post('/:id/columns', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const [boardRows] = await pool.query(`SELECT * FROM board WHERE board_id = ?`, [id]);
        if (boardRows.length === 0) return sendNotFound(res, 'Board', id);

        if (!name) return res.status(400).json({ message: 'El nombre de la columna es obligatorio' });

        const [result] = await pool.query(`INSERT INTO columns_table (name) VALUES (?)`, [name]);
        const newColumnId = result.insertId;

        await pool.query(`INSERT INTO board_column (id_board, id_column) VALUES (?, ?)`, [id, newColumnId]);

        res.status(201).json({ column_id: newColumnId, name });

    } catch (error) {
        handleError(res, error, 'crear columna');
    }
});

// GET /boards/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`SELECT * FROM board WHERE board_id = ?`, [id]);

        if (rows.length === 0) return sendNotFound(res, 'Board', id);

        res.status(200).json(rows[0]);
    } catch (error) {
        handleError(res, error, 'obtener board por id');
    }
});

// GET /boards/name/:nombre
router.get('/name/:nombre', verifyToken, async (req, res) => {
    try {
        const { nombre } = req.params;
        const [rows] = await pool.query(`SELECT * FROM board WHERE name = ?`, [nombre]);

        if (rows.length === 0) return sendNotFound(res, 'Board', nombre);

        res.status(200).json(rows[0]);
    } catch (error) {
        handleError(res, error, 'obtener board por nombre');
    }
});



module.exports = router;