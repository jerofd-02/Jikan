const express = require('express');
const router = express.Router();

const pool = require("../config/database");

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM board`);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener los boards:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`SELECT * FROM board WHERE board_id = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: `Board con id ${id} no encontrado` });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener el board:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.get('/:id/full', async (req, res) => {
    try {
        const { id } = req.params;

        const [boardRows] = await pool.query(`SELECT * FROM board WHERE board_id = ?`, [id]);
        if (boardRows.length === 0) {
            return res.status(404).json({ message: `Board con id ${id} no encontrado` });
        }

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

            return {
                ...column,
                tasks: taskRows
            };
        }));

        const fullBoard = {
            ...boardRows[0],
            columns: columnsWithTasks
        };

        res.status(200).json(fullBoard);

    } catch (error) {
        console.error('Error al obtener el board completo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;