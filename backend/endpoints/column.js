const express = require('express');
const router = express.Router();

const pool = require("../config/database");
const {handleError} = require("../utils/errors");
const {sendNotFound, verifyToken} = require("../utils/validations");

// POST /columns
router.post('/', verifyToken, async (req, res) => {
    try {
        const {id_board, name, position = 0} = req.body;

        if (!id_board || !name) {
            return res.status(400).json({message: 'id_board y name son obligatorios'});
        }

        const [colResult] = await pool.query(
            `INSERT INTO columns_table (name)
             VALUES (?)`,
            [name]
        );

        const columnId = colResult.insertId;

        await pool.query(
            `INSERT INTO board_column (id_board, id_column)
             VALUES (?, ?)`,
            [id_board, columnId]
        );

        res.status(201).json({
            id_column: columnId,
            id_board,
            name,
            position
        });

    } catch (error) {
        handleError(res, error, 'crear columna');
    }
});

// GET /columns/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;

        const [[column]] = await pool.query(
            `SELECT c.column_id AS id_column,
                    c.name,
                    bc.id_board
             FROM columns_table c
                      JOIN board_column bc ON bc.id_column = c.column_id
             WHERE c.column_id = ?`,
            [id]
        );

        if (!column) return sendNotFound(res, 'Columna', id);

        res.status(200).json(column);

    } catch (error) {
        handleError(res, error, 'obtener columna');
    }
});

// GET /columns/:id/tasks
router.get('/:id/tasks', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;

        const [tasks] = await pool.query(
            `SELECT t.id_task,
                    t.id_column,
                    t.name,
                    t.description,
                    t.date,
                    t.deadline,
                    GROUP_CONCAT(l.label) AS labels
             FROM column_task t
                      LEFT JOIN task_labels l ON l.task_id = t.id_task
             WHERE t.id_column = ?
             GROUP BY t.id_task`,
            [id]
        );

        res.status(200).json(tasks);

    } catch (error) {
        handleError(res, error, 'obtener tareas de columna');
    }
});

// PATCH /columns/:id
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;
        const {name} = req.body;

        if (!name) {
            return res.status(400).json({message: 'El nombre es obligatorio'});
        }

        const [result] = await pool.query(
            `UPDATE columns_table
             SET name = ?
             WHERE column_id = ?`,
            [name, id]
        );

        if (result.affectedRows === 0) {
            return sendNotFound(res, 'Columna', id);
        }

        res.status(200).json({id_column: id, name});

    } catch (error) {
        handleError(res, error, 'renombrar columna');
    }
});

// DELETE /columns/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;

        const [result] = await pool.query(
            `DELETE
             FROM columns_table
             WHERE column_id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return sendNotFound(res, 'Columna', id);
        }

        res.status(200).json({message: 'Columna eliminada correctamente'});

    } catch (error) {
        handleError(res, error, 'eliminar columna');
    }
});

module.exports = router;