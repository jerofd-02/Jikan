const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../utils/validations');
const pool = require('../config/database');
const { handleError } = require('../utils/errors');

// PATCH /users/name
router.patch('/name', verifyToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim())
            return res.status(400).json({ message: 'El nombre no puede estar vacío' });

        await pool.query(`UPDATE users SET name = ? WHERE id = ?`, [name.trim(), req.user.id]);
        res.status(200).json({ message: 'Nombre actualizado correctamente', name: name.trim() });
    } catch (error) {
        handleError(res, error, 'actualizar nombre');
    }
});

// PATCH /users/mail
router.patch('/mail', verifyToken, async (req, res) => {
    try {
        const { mail } = req.body;
        if (!mail || !mail.trim())
            return res.status(400).json({ message: 'El correo no puede estar vacío' });

        const [existing] = await pool.query(
            `SELECT id FROM users WHERE mail = ? AND id != ?`, [mail.trim(), req.user.id]
        );
        if (existing.length > 0)
            return res.status(409).json({ message: 'Ese correo ya está en uso' });

        await pool.query(`UPDATE users SET mail = ? WHERE id = ?`, [mail.trim(), req.user.id]);
        res.status(200).json({ message: 'Correo actualizado correctamente', mail: mail.trim() });
    } catch (error) {
        handleError(res, error, 'actualizar correo');
    }
});

// PATCH /users/password
router.patch('/password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword)
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });

        if (newPassword !== confirmPassword)
            return res.status(400).json({ message: 'Las contraseñas nuevas no coinciden' });

        if (newPassword.length < 4)
            return res.status(400).json({ message: 'La contraseña debe tener al menos 4 caracteres' });

        const [rows] = await pool.query(`SELECT password FROM users WHERE id = ?`, [req.user.id]);
        const user = rows[0];

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match)
            return res.status(401).json({ message: 'La contraseña actual es incorrecta' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [hashed, req.user.id]);

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        handleError(res, error, 'actualizar contraseña');
    }
});

// GET /users/jikoins
router.get('/jikoins', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT jikoins FROM users WHERE id = ?`,
            [req.user.id]
        );
        if (!rows.length)
            return res.status(404).json({ message: 'Usuario no encontrado' });

        res.status(200).json(rows[0]);
    } catch (error) {
        handleError(res, error, 'obtener jikoins del usuario');
    }
});

module.exports = router;