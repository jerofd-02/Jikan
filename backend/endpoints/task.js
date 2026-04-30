const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/validations');

const pool = require("../config/database");

// GET /tasks — obtener todas las tareas
router.get('/', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT *
                                         FROM column_task`);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener las tareas:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
});

// GET /tasks/labels/all — obtener todos los labels únicos
router.get('/labels/all', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT DISTINCT label
                                         FROM task_labels
                                         ORDER BY label`);
        res.status(200).json(rows.map(r => r.label));
    } catch (error) {
        console.error("Error al obtener los labels:", error);
        res.status(500).json({message: "Error interno del servidor"});
    }
});

// GET /tasks/:id — obtener una tarea por id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;
        const [rows] = await pool.query(`SELECT *
                                         FROM column_task
                                         WHERE id_task = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({message: `Tarea con id ${id} no encontrada`});
        }

        // Incluir labels de la tarea
        const [labels] = await pool.query(`SELECT label
                                           FROM task_labels
                                           WHERE task_id = ?`, [id]);

        res.status(200).json({
            ...rows[0], labels: labels.map(l => l.label),
        });
    } catch (error) {
        console.error('Error al obtener la tarea:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
});

// POST /tasks — crear una nueva tarea
// Body: { id_column, name, description?, date?, labels? }
router.post('/', verifyToken, async (req, res) => {
    try {
        const {id_column, name, description = null, date = null, labels = []} = req.body;

        if (!id_column || !name) {
            return res.status(400).json({message: 'Los campos id_column y name son obligatorios'});
        }

        const [result] = await pool.query(
            `INSERT INTO column_task (id_column, name, description, date)
             VALUES (?, ?, ?, ?)`,
            [id_column, name, description, date]
        );

        const newTaskId = result.insertId;

        // Insertar labels si se proporcionan
        if (labels.length > 0) {
            const labelValues = labels.map(label => [label, newTaskId]);
            await pool.query(
                `INSERT INTO task_labels (label, task_id)
                 VALUES ?`,
                [labelValues]
            );
        }

        res.status(201).json({
            message: 'Tarea creada correctamente',
            id_task: newTaskId,
        });
    } catch (error) {
        console.error('Error al crear la tarea:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
});

// PUT /tasks/:id — reemplazar una tarea completa
// Body: { id_column, name, description?, date?, labels? }
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;
        const {id_column, name, description = null, date = null, deadline = null, labels = []} = req.body;

        if (!id_column || !name) {
            return res.status(400).json({message: 'Los campos id_column y name son obligatorios'});
        }

        const [check] = await pool.query(`SELECT id_task
                                          FROM column_task
                                          WHERE id_task = ?`, [id]);
        if (check.length === 0) {
            return res.status(404).json({message: `Tarea con id ${id} no encontrada`});
        }

        await pool.query(`UPDATE column_task
                          SET id_column   = ?,
                              name        = ?,
                              description = ?,
                              date        = ?,
                              deadline    = ?
                          WHERE id_task = ?`, [id_column, name, description, date, deadline, id]);

        // Reemplazar labels
        await pool.query(`DELETE
                          FROM task_labels
                          WHERE task_id = ?`, [id]);
        if (labels.length > 0) {
            const labelValues = labels.map(label => [label, id]);
            await pool.query(`INSERT INTO task_labels (label, task_id)
                              VALUES ?`, [labelValues]);
        }

        res.status(200).json({message: 'Tarea actualizada correctamente'});
    } catch (error) {
        console.error('Error al reemplazar la tarea:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
});

// PATCH /tasks/:id — actualizar campos específicos de una tarea
// Body: { id_column?, name?, description?, date?, labels? }
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;
        const {id_column, name, description, date, deadline, labels} = req.body;

        const [check] = await pool.query(`SELECT id_task
                                          FROM column_task
                                          WHERE id_task = ?`, [id]);
        if (check.length === 0) {
            return res.status(404).json({message: `Tarea con id ${id} no encontrada`});
        }

        // Construir SET dinámico solo con los campos enviados
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
            values.push(id);
            await pool.query(`UPDATE column_task
                              SET ${fields.join(', ')}
                              WHERE id_task = ?`, values);
        }

        // Actualizar labels solo si se proporcionan
        if (labels !== undefined) {
            await pool.query(`DELETE
                              FROM task_labels
                              WHERE task_id = ?`, [id]);
            if (labels.length > 0) {
                const labelValues = labels.map(label => [label, id]);
                await pool.query(`INSERT INTO task_labels (label, task_id)
                                  VALUES ?`, [labelValues]);
            }
        }

        res.status(200).json({message: 'Tarea actualizada correctamente'});
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
});

// DELETE /tasks/:id — eliminar una tarea
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;

        const [check] = await pool.query(`SELECT id_task
                                          FROM column_task
                                          WHERE id_task = ?`, [id]);
        if (check.length === 0) {
            return res.status(404).json({message: `Tarea con id ${id} no encontrada`});
        }

        // Las labels se eliminan en cascada por FK, pero lo hacemos explícito
        await pool.query(`DELETE
                          FROM column_task
                          WHERE id_task = ?`, [id]);

        res.status(200).json({message: `Tarea con id ${id} eliminada correctamente`});
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
});

module.exports = router;