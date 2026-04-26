const express = require('express');
const router = express.Router();

const pool = require("../config/database");
const {handleError} = require("../utils/errors");
const {validateRequired, sendNotFound} = require("../utils/validations");

// GET /tasks
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT *
                                         FROM column_task`);
        res.status(200).json(rows);
    } catch (error) {
        handleError(res, error, 'obtener todas las tareas');
    }
});

// GET /tasks/:id
router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const [rows] = await pool.query(
            `SELECT *
             FROM column_task
             WHERE id_task = ?`, [id]
        );

        if (rows.length === 0) return sendNotFound(res, 'Tarea', id);

        const [labels] = await pool.query(
            `SELECT label
             FROM task_labels
             WHERE task_id = ?`, [id]
        );

        const [categories] = await pool.query(
            `SELECT c.id_category, c.name
             FROM task_categories tc
                      JOIN categories c ON tc.id_category = c.id_category
             WHERE tc.task_id = ?`, [id]
        );

        res.status(200).json({...rows[0], labels: labels.map(l => l.label), categories});
    } catch (error) {
        handleError(res, error, 'obtener tarea por id');
    }
});

// POST /tasks
router.post('/', async (req, res) => {
    try {
        const {id_column, name, description = null, date = null, labels = []} = req.body;

        const validation = validateRequired(['id_column', 'name'], req.body);
        if (!validation.valid) return res.status(400).json({success: false, message: validation.message});

        const [result] = await pool.query(
            `INSERT INTO column_task (id_column, name, description, date)
             VALUES (?, ?, ?, ?)`,
            [id_column, name, description, date]
        );

        const newTaskId = result.insertId;

        if (labels.length > 0) {
            await pool.query(
                `INSERT INTO task_labels (label, task_id)
                 VALUES ?`,
                [labels.map(label => [label, newTaskId])]
            );
        }

        res.status(201).json({message: 'Tarea creada correctamente', id_task: newTaskId});
    } catch (error) {
        handleError(res, error, 'crear tarea');
    }
});

// PUT /tasks/:id
router.put('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {id_column, name, description = null, date = null, labels = []} = req.body;

        const validation = validateRequired(['id_column', 'name'], req.body);
        if (!validation.valid) return res.status(400).json({success: false, message: validation.message});

        const [check] = await pool.query(`SELECT id_task
                                          FROM column_task
                                          WHERE id_task = ?`, [id]);
        if (check.length === 0) return sendNotFound(res, 'Tarea', id);

        await pool.query(
            `UPDATE column_task
             SET id_column   = ?,
                 name        = ?,
                 description = ?,
                 date        = ?
             WHERE id_task = ?`,
            [id_column, name, description, date, id]
        );

        await pool.query(`DELETE
                          FROM task_labels
                          WHERE task_id = ?`, [id]);
        if (labels.length > 0) {
            await pool.query(
                `INSERT INTO task_labels (label, task_id)
                 VALUES ?`,
                [labels.map(label => [label, id])]
            );
        }

        res.status(200).json({message: 'Tarea actualizada correctamente'});
    } catch (error) {
        handleError(res, error, 'reemplazar tarea');
    }
});

// PATCH /tasks/:id
router.patch('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {id_column, name, description, date, deadline, labels, categories} = req.body;

        const [check] = await pool.query(`SELECT id_task
                                          FROM column_task
                                          WHERE id_task = ?`, [id]);
        if (check.length === 0) return sendNotFound(res, 'Tarea', id);

        const fields = [];
        const values = [];

        if (id_column !== undefined) {
            fields.push('id_column = ?');
            values.push(id_column);
        }
        if (name !== undefined) {
            fields.push('name = ?');
            values.push(name);
        }
        if (description !== undefined) {
            fields.push('description = ?');
            values.push(description);
        }
        if (date !== undefined) {
            fields.push('date = ?');
            values.push(date);
        }

        if (deadline !== undefined) {
            fields.push('deadline = ?');
            values.push(deadline);
        }

        if (fields.length > 0) {
            await pool.query(
                `UPDATE column_task
                 SET ${fields.join(', ')}
                 WHERE id_task = ?`,
                [...values, id]
            );
        }

        if (labels !== undefined) {
            await pool.query(`DELETE
                              FROM task_labels
                              WHERE task_id = ?`, [id]);
            if (labels.length > 0) {
                await pool.query(
                    `INSERT INTO task_labels (label, task_id)
                     VALUES ?`,
                    [labels.map(label => [label, id])]
                );
            }
        }

        if (categories !== undefined) {
            await pool.query(`DELETE
                              FROM task_categories
                              WHERE task_id = ?`, [id]);
            if (categories.length > 0) {
                await pool.query(
                    `INSERT INTO task_categories (task_id, id_category)
                     VALUES ?`,
                    [categories.map(id_category => [id, id_category])]
                )
            }
        }

        res.status(200).json({message: 'Tarea actualizada correctamente'});
    } catch (error) {
        handleError(res, error, 'actualizar tarea parcial');
    }
});

// DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params;

        const [check] = await pool.query(`SELECT id_task
                                          FROM column_task
                                          WHERE id_task = ?`, [id]);
        if (check.length === 0) return sendNotFound(res, 'Tarea', id);

        await pool.query(`DELETE
                          FROM column_task
                          WHERE id_task = ?`, [id]);

        res.status(200).json({message: `Tarea con id ${id} eliminada correctamente`});
    } catch (error) {
        handleError(res, error, 'eliminar tarea');
    }
});

module.exports = router;