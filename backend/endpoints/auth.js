const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = require('../config/database');
const { handleError } = require('../utils/errors');

const JWT_SECRET = "tu_secreto_seguro"; // mueve esto a una variable de entorno después

// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, mail, password } = req.body;

        if (!name || !mail || !password)
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });

        const [existing] = await pool.query(
            `SELECT mail FROM users WHERE mail = ?`, [mail]
        );
        if (existing.length > 0)
            return res.status(409).json({ message: 'El email ya está registrado' });

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users (name, mail, password) VALUES (?, ?, ?)`,
            [name, mail, hashedPassword]
        );

        // Crear board básico
        const [boardResult] = await pool.query(
            `INSERT INTO board (name) VALUES (?)`,
            [`Tablero de ${name}`]
        );
        const boardId = boardResult.insertId;

        //Añadir columnas
        const columnasBasicas = ['To Do', 'In Progress', 'Done'];

        for (const nombreColumna of columnasBasicas) {

            const [colResult] = await pool.query(
                `INSERT INTO columns_table (name) VALUES (?)`,
                [nombreColumna]
            );
            const columnId = colResult.insertId;

            await pool.query(
                `INSERT INTO board_column (id_board, id_column) VALUES (?, ?)`,
                [boardId, columnId]
            );
        }

        // Vincular usuario con el board
        await pool.query( 
            `INSERT INTO users_board (user_mail, board_id) VALUES (?, ?)`,
            [mail, boardId]
        );

        // Generar token
        const token = jwt.sign({ mail }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, mail, name, boardId });

    } catch (error) {
        handleError(res, error, 'registrar usuario');
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { mail, password } = req.body;

        if (!mail || !password)
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });

        const [rows] = await pool.query(
            `SELECT * FROM users WHERE mail = ?`, [mail]
        );
        if (rows.length === 0)
            return res.status(401).json({ message: 'Email o contraseña incorrectos' });

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
            return res.status(401).json({ message: 'Email o contraseña incorrectos' });

        const [boardRows] = await pool.query(
            `SELECT board_id FROM users_board WHERE user_mail = ?`, [mail]
        );
        const boardId = boardRows[0]?.board_id;

        const token = jwt.sign({ mail }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ token, mail, name: user.name, boardId });

    } catch (error) {
        handleError(res, error, 'iniciar sesión');
    }
});

module.exports = router;