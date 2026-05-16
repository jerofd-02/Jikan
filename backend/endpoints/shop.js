const express = require('express');
const router = express.Router();

const pool = require("../config/database");
const {handleError} = require("../utils/errors");
const {sendNotFound, verifyToken} = require("../utils/validations");

// GET /shop/objects
router.get('/objects', verifyToken, async (req, res) => {
    try {
        const [objects] = await pool.query(`SELECT * FROM objects`);
        res.json(objects);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener los objetos'});
    }
});

// POST /shop/purchase
router.post('/purchase', verifyToken, async (req, res) => {
  const { id_object } = req.body;
  const userId = req.user.id;

  try {
    const [objects] = await pool.query(
      'SELECT * FROM objects WHERE object_id = ?',
      [id_object]
    );

    if (objects.length === 0) {
      return res.status(404).json({ error: 'Objeto no encontrado' });
    }

    const object = objects[0];

    if (object.one_time) {
      const [existing] = await pool.query(
        'SELECT purchase_id FROM purchases WHERE id_user = ? AND id_object = ?',
        [userId, id_object]
      );
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Ya tienes este objeto' });
      }
    }

    const [users] = await pool.query(
      'SELECT jikoins FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userJikoins = users[0].jikoins;
    
    if (userJikoins < object.object_price) {
      return res.status(400).json({ error: 'Jikoins insuficientes' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query(
            'INSERT INTO purchases (id_user, id_object, price_paid) VALUES (?, ?, ?)',
            [userId, id_object, object.object_price]
        );

        await conn.query(
            'UPDATE users SET jikoins = jikoins - ? WHERE id = ?',
            [object.object_price, userId]
        );

        await conn.commit();
        res.json({ success: true, price_paid: object.object_price, jikoins_remaining: userJikoins - object.object_price });
    } catch (err) {
        await conn.rollback();
        handleError(res, err, 'procesar compra');
    } finally {
        conn.release();
    }
  } catch (err) {
    handleError(res, err, 'procesar compra');
  }
});

module.exports = router;