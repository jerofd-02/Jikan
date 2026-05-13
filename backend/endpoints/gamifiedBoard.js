const express = require('express');
const router = express.Router();

const pool = require("../config/database");
const {handleError} = require("../utils/errors");
const {sendNotFound, verifyToken} = require("../utils/validations");

// POST /boards/gamified
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

        await pool.query(
            'INSERT INTO gamified_board (id_board) VALUES (?)', [boardId]
        );

        const basicColumns = ['Por hacer', 'En progreso', 'Finalizadas'];
        for (let column of basicColumns) {
            let [createColumn] = await pool.query(`INSERT INTO columns_table (name) VALUES (?)`, [column]);
            let newColumnId = createColumn.insertId

            await pool.query(`INSERT INTO board_column (id_board, id_column)
                          VALUES (?, ?)`, [boardId, newColumnId]);
        }

        res.status(201).json({
            board_id: result.insertId,
            name
        });

    } catch (error) {
        handleError(res, error, 'crear board');
    }
});

// GET /boards/gamified/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;
        const [rows] = await pool.query(`SELECT *
                                         FROM gamified_board
                                         WHERE id_board = ?`, [id]);

        if (rows.length === 0) return sendNotFound(res, 'GamifiedBoard', id);

        res.status(200).json(rows[0]);
    } catch (error) {
        handleError(res, error, 'obtener gamified_board por id');
    }
});

// GET /boards/gamified/name/:nombre
router.get('/name/:nombre', verifyToken, async (req, res) => {
    try {
        const {nombre} = req.params;

        const [boardRows] = await pool.query('SELECT board_id FROM board WHERE name = ?', [nombre]);

        if (boardRows.length === 0) return sendNotFound(res, 'Board', nombre);
        const id = boardRows[0].board_id

        const [rows] = await pool.query(`SELECT *
                                         FROM gamified_board
                                         WHERE id_board = ?`, [id]);

        if (rows.length === 0) return sendNotFound(res, 'GamifiedBoard', id);

        res.status(200).json(rows[0]);
    } catch (error) {
        handleError(res, error, 'obtener gamified_board por nombre');
   
    }
});

// GET /boards/gamified/:id/full
router.get('/:id/full', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // JOIN directo entre board y gamified_board
        const [boardRows] = await pool.query(`
            SELECT b.*,
                   g.daily_tasks,
                   g.current_streak,
                   g.best_streak
            FROM board b
                INNER JOIN gamified_board g ON b.board_id = g.id_board
            WHERE b.board_id = ?
        `, [id]);

        if (boardRows.length === 0) return sendNotFound(res, 'GamifiedBoard', id);

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

        res.status(200).json({
            ...boardRows[0],
            columns: columnsWithTasks
        });

    } catch (error) {
        handleError(res, error, 'obtener gamified board completo');
    }
});

module.exports = router;