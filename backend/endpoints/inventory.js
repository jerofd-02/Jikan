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

module.exports = router;