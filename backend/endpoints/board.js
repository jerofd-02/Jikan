const express = require('express');
const router = express.Router();

const pool = require("../config/database");
const {handleError} = require("../utils/errors");
const {sendNotFound, verifyToken} = require("../utils/validations");

// DELETE /boards/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.user.id;

        const [boardRows] = await pool.query(`SELECT *
                                              FROM board
                                              WHERE board_id = ?`, [id]);
        if (boardRows.length === 0) return sendNotFound(res, 'Board', id);

        const [userBoard] = await pool.query(
            `SELECT *
             FROM users_board
             WHERE board_id = ?
               AND user_id = ?`, [id, userId]
        );

        if (userBoard.length === 0) {
            return res.status(403).json({message: 'No tienes permiso para eliminar este tablero'});
        }

        await pool.query(`DELETE
                          FROM board
                          WHERE board_id = ?`, [id]);

        await pool.query(`DELETE
                          FROM column_task
                          WHERE id_column IN (SELECT id_column
                                              FROM board_column
                                              WHERE id_board = ?)`, [id]);

        await pool.query(`DELETE
                          FROM board_column
                          WHERE id_board = ?`, [id]);

        await pool.query(`DELETE
                          FROM users_board
                          WHERE board_id = ?`, [id]);

        res.status(200).json({message: 'Tablero eliminado correctamente'});

    } catch (error) {
        handleError(res, error, 'eliminar board');
    }
});

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
        const {id} = req.params;

        const [boardRows] = await pool.query(`SELECT *
                                              FROM board
                                              WHERE board_id = ?`, [id]);
        if (boardRows.length === 0) return sendNotFound(res, 'Board', id);

        const [columnRows] = await pool.query(`
            SELECT c.column_id, c.name
            FROM columns_table c
                     INNER JOIN board_column bc ON c.column_id = bc.id_column
            WHERE bc.id_board = ?
        `, [id]);

        const columnsWithTasks = await Promise.all(columnRows.map(async (column) => {
            const [taskRows] = await pool.query(`
                SELECT t.id_task,
                       t.name,
                       t.description,
                       t.date,
                       t.deadline,
                       GROUP_CONCAT(tl.label) AS labels
                FROM column_task t
                         LEFT JOIN task_labels tl ON tl.task_id = t.id_task
                WHERE t.id_column = ?
                GROUP BY t.id_task
            `, [column.column_id]);

            return {
                ...column,
                tasks: taskRows.map(t => ({
                    ...t,
                    labels: t.labels ? t.labels.split(',') : []
                }))
            };
        }));

        res.status(200).json({...boardRows[0], columns: columnsWithTasks});
    } catch (error) {
        handleError(res, error, 'obtener board completo');
    }
});

// POST /boards
router.post('/', verifyToken, async (req, res) => {
    try {
        const {name} = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({message: 'El nombre del board es obligatorio'});
        }

        const [result] = await pool.query(
            `INSERT INTO board (name)
             VALUES (?)`,
            [name]
        );

        const boardId = result.insertId;

        await pool.query(
            `INSERT INTO users_board (user_id, board_id)
             VALUES (?, ?)`,
            [userId, boardId]
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
        const {id} = req.params;
        const {name} = req.body;

        const [boardRows] = await pool.query(`SELECT *
                                              FROM board
                                              WHERE board_id = ?`, [id]);
        if (boardRows.length === 0) return sendNotFound(res, 'Board', id);

        if (!name) return res.status(400).json({message: 'El nombre de la columna es obligatorio'});

        const [result] = await pool.query(`INSERT INTO columns_table (name)
                                           VALUES (?)`, [name]);
        const newColumnId = result.insertId;

        await pool.query(`INSERT INTO board_column (id_board, id_column)
                          VALUES (?, ?)`, [id, newColumnId]);

        res.status(201).json({column_id: newColumnId, name});

    } catch (error) {
        handleError(res, error, 'crear columna');
    }
});

// PATCH /boards/:id
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;
        const {name} = req.body;
        const userId = req.user.id;

        // Verificar que el tablero existe
        const [boardRows] = await pool.query(`SELECT *
                                              FROM board
                                              WHERE board_id = ?`, [id]);
        if (boardRows.length === 0) return sendNotFound(res, 'Board', id);

        // Verificar que el usuario tiene permiso para actualizar este tablero
        const [userBoard] = await pool.query(
            `SELECT *
             FROM users_board
             WHERE board_id = ?
               AND user_id = ?`, [id, userId]
        );

        if (userBoard.length === 0) {
            return res.status(403).json({message: 'No tienes permiso para actualizar este tablero'});
        }

        // Validar que al menos se envíe un campo a actualizar
        if (!name) {
            return res.status(400).json({message: 'Debes proporcionar al menos un campo para actualizar'});
        }

        // Actualizar el tablero
        await pool.query(`UPDATE board
                          SET name = ?
                          WHERE board_id = ?`, [name, id]);

        res.status(200).json({
            board_id: id,
            name
        });

    } catch (error) {
        handleError(res, error, 'actualizar board');
    }
});

// GET /boards/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;
        const [rows] = await pool.query(`SELECT *
                                         FROM board
                                         WHERE board_id = ?`, [id]);

        if (rows.length === 0) return sendNotFound(res, 'Board', id);

        res.status(200).json(rows[0]);
    } catch (error) {
        handleError(res, error, 'obtener board por id');
    }
});

// GET /boards/name/:nombre
router.get('/name/:nombre', verifyToken, async (req, res) => {
    try {
        const {nombre} = req.params;
        const [rows] = await pool.query(`SELECT *
                                         FROM board
                                         WHERE name = ?`, [nombre]);

        if (rows.length === 0) return sendNotFound(res, 'Board', nombre);

        res.status(200).json(rows[0]);
    } catch (error) {
        handleError(res, error, 'obtener board por nombre');
    }
});


module.exports = router;