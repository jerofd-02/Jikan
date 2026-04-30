const express = require('express');
const router = express.Router();

const pool = require("../config/database");
const {handleError} = require("../utils/errors");
const {sendNotFound, verifyToken} = require("../utils/validations");

// PATCH /columns/:id
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;
        const {name} = req.body;

        if (!name) return res.status(400).json({message: 'El nombre es obligatorio'});

        const [result] = await pool.query(
            `UPDATE columns_table
             SET name = ?
             WHERE column_id = ?`,
            [name, id]
        );

        if (result.affectedRows === 0) return sendNotFound(res, 'Columna', id);

        res.status(200).json({column_id: id, name});

    } catch (error) {
        handleError(res, error, 'renombrar columna');
    }
});

// DELETE /columns/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            `DELETE FROM columns_table WHERE column_id = ?`, [id]
        );

        if (result.affectedRows === 0) return sendNotFound(res, 'Columna', id);

        res.status(200).json({ message: 'Columna eliminada correctamente' });

    } catch (error) {
        handleError(res, error, 'eliminar columna');
    }
});

module.exports = router;