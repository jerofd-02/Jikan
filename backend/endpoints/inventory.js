const express = require('express');
const router = express.Router();

const pool = require("../config/database");
const {handleError} = require("../utils/errors");
const {sendNotFound, verifyToken} = require("../utils/validations");


// GET /api/inventory
router.get('/inventory', verifyToken, async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT 
        o.object_id,
        o.object_name,
        o.object_category,
        o.object_description,
        o.object_img,
        p.purchase_id,
        p.price_paid,
        p.bought_at
      FROM purchases p
      JOIN objects o ON p.id_object = o.object_id
      WHERE p.id_user = ?
      ORDER BY p.bought_at DESC
    `, [req.user.id]);

    res.json(items);
  } catch (err) {
    handleError(res, err, 'obtener inventario');
  }
});

// GET /api/inventory/use/boost/:id
router.patch('/inventory/use/boost/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [purchase] = await pool.query(`SELECT * FROM purchases WHERE purchase_id = ?`, [id]);

    if (purchase.length === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    const [multiplier] = await pool.query(`SELECT * FROM objects WHERE object_id = ?`, [purchase[0].id_object]);


    if (multiplier.length === 0) return res.status(400).json({ error: 'El objeto no existe' });
    if (multiplier[0].object_category != 'Potenciador') return res.status(400).json({ error: 'El objeto no es un potenciador' });
    if (purchase[0].used_at != null) return res.status(400).json({ error: 'Este potenciador ya ha sido utilizado previamente' });

    const multiplierMatch = multiplier[0].object_name.match(/x(\d+)/);
    if (!multiplierMatch) {
      return res.status(400).json({ error: 'El objeto no tiene un multiplicador válido' });
    }

    const multiplierValue = parseInt(multiplierMatch[1]);

    await pool.query(
      'UPDATE users SET multiplier = ?, boosted_until = DATE_ADD(NOW(), INTERVAL 24 HOUR) WHERE id = ?',
      [multiplierValue, userId]
    );

    await pool.query(
      'UPDATE purchases SET used_at = CURRENT_TIMESTAMP WHERE purchase_id = ?', 
      [id]
    );

    res.json({ success: true, multiplier: multiplierValue, message: 'Potenciador aplicado correctamente' });
  } catch (err) {
    handleError(res, err, 'usar potenciador');
  }
});

// GET /api/inventory/use/protector/:id
router.patch('/inventory/use/protector/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [purchase] = await pool.query(`SELECT * FROM purchases WHERE purchase_id = ?`, [id]);

    if (purchase.length === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    const [protector] = await pool.query(`SELECT * FROM objects WHERE object_id = ?`, [purchase[0].id_object]);


    if (protector.length === 0) return res.status(400).json({ error: 'El objeto no existe' });
    if (protector[0].object_category != 'Protector') return res.status(400).json({ error: 'El objeto no es un protector' });
    if (purchase[0].uset_at != null) return res.status(400).json({ error: 'Este protector ya ha sido utilizado previamente' });

    const daysMatch = protector[0].object_name.match(/^(\d+)\s+d[ií]as?$/i);
    if (!daysMatch) {
      return res.status(400).json({ error: 'El objeto no tiene un número de días válido' });
    }

    const daysValue = parseInt(daysMatch[1]);

    await pool.query(
      'UPDATE users SET protect_until = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE id = ?',
      [daysValue, userId]
    );

    await pool.query(
      'UPDATE purchases SET used_at = CURRENT_TIMESTAMP WHERE purchase_id = ?', 
      [id]
    );

    res.json({ success: true, protector: daysValue, message: 'Protector aplicado correctamente' });
  } catch (err) {
    handleError(res, err, 'usar protector');
  }
});

module.exports = router;