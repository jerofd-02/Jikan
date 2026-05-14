const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require("../config/database");
const {handleError} = require("../utils/errors");
const {verifyToken} = require("../utils/validations");

// POST /api/invitations/send
router.post('/send', verifyToken, async (req, res) => {
    const {board_id, invited_mail} = req.body;
    const invited_by = req.user.id;

    try {
        const [invitee] = await pool.query(
            'SELECT id FROM users WHERE mail = ?',
            [invited_mail]
        );
        if (!invitee.length) return res.status(404).json({error: 'Usuario no encontrado'});

        const [isMember] = await pool.query(
            'SELECT 1 FROM users_board WHERE user_id = ? AND board_id = ?',
            [invited_by, board_id]
        );
        if (!isMember.length) return res.status(403).json({error: 'Sin permisos'});

        const [alreadyMember] = await pool.query(
            'SELECT 1 FROM users_board WHERE user_id = ? AND board_id = ?',
            [invitee[0].id, board_id]
        );
        if (alreadyMember.length) return res.status(409).json({error: 'El usuario ya es miembro del tablero'});

        const [existing] = await pool.query(
            'SELECT 1 FROM board_invitations WHERE board_id = ? AND invited_mail = ? AND status = "pending"',
            [board_id, invited_mail]
        );
        if (existing.length) return res.status(409).json({error: 'Ya existe una invitación pendiente para este usuario'});

        const token = crypto.randomUUID();
        await pool.query(
            `INSERT INTO board_invitations (board_id, invited_by, invited_mail, token)
             VALUES (?, ?, ?, ?)`,
            [board_id, invited_by, invited_mail, token]
        );

        res.json({ok: true});

    } catch (err) {
        handleError(res, err);
    }
});

// GET /api/invitations/pending
router.get('/pending', verifyToken, async (req, res) => {
    try {
        const [user] = await pool.query(
            'SELECT mail FROM users WHERE id = ?',
            [req.user.id]
        );
        if (!user.length) return res.status(401).json({error: 'No autenticado'});

        const [invitations] = await pool.query(
            `SELECT bi.invitation_id,
                    bi.board_id,
                    b.name AS board_name,
                    u.name AS invited_by_name,
                    bi.created_at,
                    bi.token
             FROM board_invitations bi
                      JOIN board b ON b.board_id = bi.board_id
                      JOIN users u ON u.id = bi.invited_by
             WHERE bi.invited_mail = ?
               AND bi.status = 'pending'`,
            [user[0].mail]
        );

        res.json(invitations);

    } catch (err) {
        handleError(res, err);
    }
});

// POST /api/invitations/respond
router.post('/respond', verifyToken, async (req, res) => {
    const {token, action} = req.body;

    const VALID_ACTIONS = ['accepted', 'rejected'];
    if (!VALID_ACTIONS.includes(action)) {
        return res.status(400).json({error: 'Acción no válida'});
    }

    try {
        const [user] = await pool.query(
            'SELECT id, mail FROM users WHERE id = ?',
            [req.user.id]
        );

        const [inv] = await pool.query(
            'SELECT * FROM board_invitations WHERE token = ? AND invited_mail = ? AND status = "pending"',
            [token, user[0].mail]
        );
        if (!inv.length) return res.status(404).json({error: 'Invitación no válida'});

        await pool.query(
            'UPDATE board_invitations SET status = ? WHERE token = ?',
            [action, token]
        );

        if (action === 'accepted') {
            await pool.query(
                'INSERT IGNORE INTO users_board (user_id, board_id) VALUES (?, ?)',
                [user[0].id, inv[0].board_id]
            );
        }

        res.json({ok: true});

    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;