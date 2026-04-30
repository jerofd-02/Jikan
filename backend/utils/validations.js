const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "NKJ.BGD125_$HG";
const MAX_AGE = 7 * 60 * 60 * 24; // 1 día en segundos

/**
 * función que comprueba que los campos requeridos se encuentren en la respuesta
 * de la petición a la base de datos
 * @param {string[]} fields  - Nombres de los campos obligatorios
 * @param {object}   body    - req.body de la petición
 * @returns {{ valid: boolean, message?: string }}
 */
function validateRequired(fields, body) {
    const missing = fields.filter(
        (field) => body[field] === undefined || body[field] === null || body[field] === ''
    );

    if (missing.length > 0) {
        return {
            valid: false,
            message: `Los siguientes campos son obligatorios: ${missing.join(', ')}.`,
        };
    }

    return { valid: true };
}

/**
 * función que devuelve error 404 cuando no se ha encontrado un recurso por el que se pregunta
 * @param {import('express').Response} res      - Objeto response de Express
 * @param {string}                     resource - Nombre del recurso
 * @param {number|string}              id       - Identificador buscado
 */
function sendNotFound(res, resource, id) {
    return res.status(404).json({
        success: false,
        message: `${resource} con id ${id} no encontrado.`,
    });
}

/**
 * Middleware que verifica la validez de un token JWT, comprobando que el usuario exista y que la contraseña coincida
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function verifyToken(req, res, next) {
    const {token} = req.cookies;
    if (!token) {
        console.log('No se encontró token en la cookie');
        res.clearCookie('token');
        return res.status(401).json({ valid: false, message: 'Token inválido o expirado' });
    }

    try {
        const {sub, sessionId} = jwt.verify(token, JWT_SECRET);

        const [sessions] = await pool.query(`SELECT * FROM user_sessions WHERE session_id = ? AND user_id = ?`, [sessionId, sub]);
        const session = sessions[0];

        if (!session || session.created_at < new Date(Date.now() - MAX_AGE * 1000)) {
            console.log('Sesión ifuera de tiempo 63');
            await pool.query(`DELETE FROM user_sessions WHERE session_id = ?`, [sessionId]);
            res.clearCookie('token');
            return res.status(401).json({ valid: false, message: 'Token inválido o expirado' });
        }

        const [rows] = await pool.query(
            `SELECT * FROM users WHERE id = ?`, [sub]
        );

        if (rows.length === 0) {
                console.log('Usuario no encontrado 74');
                await pool.query(`DELETE FROM user_sessions WHERE session_id = ?`, [sessionId]);
                res.clearCookie('token');
                return res.status(401).json({ valid: false, message: 'Token inválido o expirado' });
        }

        const user = rows[0];
        if (!user) {
            console.log('Usuario no encontrado 82');
            await pool.query(`DELETE FROM user_sessions WHERE session_id = ?`, [sessionId]);
            res.clearCookie('token');
            return res.status(401).json({ valid: false, message: 'Token inválido o expirado' });
        }

        req.user = { mail: user.mail, name: user.name, id: user.id };
        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        res.clearCookie('token');
        return res.status(401).json({ valid: false, message: 'Token inválido o expirado' });
    }
}

module.exports = { validateRequired, sendNotFound, verifyToken };