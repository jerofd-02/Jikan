const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/validations');

const pool = require('../config/database');
const { handleError } = require('../utils/errors');

const JWT_SECRET = "NKJ.BGD125_$HG";

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

        const [user] = (await pool.query(
            `SELECT * FROM users WHERE mail = ?`, [mail]
        ))[0];

        // Crear board básico
        const [boardResult] = await pool.query(
            `INSERT INTO board (name) VALUES (?)`,
            [`Tablero de ${name}`]
        );
        const boardId = boardResult.insertId;

        const sessionId = require('crypto').randomBytes(16).toString('hex');

        await pool.query(
            `INSERT INTO user_sessions (session_id, user_id) VALUES (?, ?)`,
            [sessionId, user.id]
        );

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
            `INSERT INTO users_board (user_id, board_id) VALUES (?, ?)`,
            [user.id, boardId]
        );

        // Generar token
        const token = jwt.sign({ sub: user.id, sessionId }, JWT_SECRET, { expiresIn: '7d' });

        res
            .cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Lax' })
            .status(201)
            .json({mail, name, boardId });

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
            `SELECT board_id FROM users_board WHERE user_id = ?`, [user.id]
        );
        const boardId = boardRows[0]?.board_id;

        const sessionId = require('crypto').randomBytes(16).toString('hex');

        await pool.query(
            `INSERT INTO user_sessions (session_id, user_id) VALUES (?, ?)`,
            [sessionId, user.id]
        );

        const token = jwt.sign({ sub: user.id, sessionId }, JWT_SECRET, { expiresIn: '7d' });

        res
            .cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Lax' })
            .status(200)
            .json({ mail, name: user.name, boardId });

    } catch (error) {
        handleError(res, error, 'iniciar sesión');
    }
});

router.get('/verify', verifyToken, async (req, res) => {
    res.json({ ok: true, mail: req.user.mail, name: req.user.name });
});

// DELETE /auth/delete-account
router.delete('/delete-account', verifyToken, async (req, res) => {
    try {
        // Usamos una conexión fija para que el SET persista
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [boardRows] = await connection.query(
                `SELECT board_id FROM users_board WHERE user_id = ?`, [req.user.id]
            );

            for (const row of boardRows) {
                const boardId = row.board_id;

                const [colRows] = await connection.query(
                    `SELECT id_column FROM board_column WHERE id_board = ?`, [boardId]
                );

                const colIds = colRows.map(c => c.id_column);

                if (colIds.length > 0) {
                    await connection.query(
                        `DELETE FROM column_task WHERE id_column IN (?)`, [colIds]
                    );
                    await connection.query(
                        `DELETE FROM board_column WHERE id_board = ?`, [boardId]
                    );
                    await connection.query(
                        `DELETE FROM columns_table WHERE column_id IN (?)`, [colIds]
                    );
                }

                // Desactivar trigger en esta misma conexión
                await connection.query(`SET @disable_trigger = 1`);
                await connection.query(
                    `DELETE FROM users_board WHERE board_id = ?`, [boardId]
                );
                await connection.query(`SET @disable_trigger = 0`);

                await connection.query(
                    `DELETE FROM board WHERE board_id = ?`, [boardId]
                );
            }

            await connection.query(`DELETE FROM user_sessions WHERE user_id = ?`, [req.user.id]);

            await connection.query(`DELETE FROM users WHERE id = ?`, [req.user.id]);

            await connection.commit();

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

        res.clearCookie('token');
        res.status(200).json({ message: 'Cuenta eliminada correctamente' });

    } catch (error) {
        handleError(res, error, 'eliminar cuenta');
    }
});

router.post('/logout', verifyToken, async (req, res) => {
    try {
        const sessionId = jwt.verify(req.cookies.token, JWT_SECRET).sessionId;

        await pool.query(`DELETE FROM user_sessions WHERE session_id = ?`, [sessionId]);

        res.clearCookie('token');
        res.status(200).json({ message: 'Sesión cerrada correctamente' });

    } catch (error) {
        handleError(res, error, 'cerrar sesión');
    }
});

module.exports = router;