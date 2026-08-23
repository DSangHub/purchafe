const crypto = require('crypto');
const { db } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { ownerName, ownerAddress, purchaseDate, purchaseSource, merchantName, purchaseAmount, factorySerial, notes } = req.body || {};
    if (!ownerName || !purchaseDate || !factorySerial) return res.status(400).json({ error: 'Name, purchase date and factory serial/barcode are required.' });

    const safeId = `PS-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const verifyToken = crypto.randomBytes(24).toString('hex');
    const sql = db();
    await sql`INSERT INTO purchafe_safe (safe_id, verify_token, owner_name, owner_address, purchase_date, purchase_source, merchant_name, purchase_amount, factory_serial, notes, status)
      VALUES (${safeId}, ${verifyToken}, ${ownerName}, ${ownerAddress || null}, ${purchaseDate}, ${purchaseSource || null}, ${merchantName || null}, ${purchaseAmount ? Number(purchaseAmount) : null}, ${factorySerial}, ${notes || null}, 'ACTIVE')`;

    const origin = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`;
    return res.status(201).json({ safeId, status: 'ACTIVE', verifyUrl: `${origin}/verify.html?token=${verifyToken}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to create Purchafe Safe record.' });
  }
};
