const { db } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const token = String(req.query.token || '').trim();
    if (!/^[a-f0-9]{48}$/i.test(token)) return res.status(400).json({ error: 'Valid verification token required.' });
    res.setHeader('Cache-Control', 'no-store');
    const sql = db();
    const rows = await sql`SELECT safe_id, factory_serial, merchant_name, purchase_date, product_name, status, redeemed_at, created_at FROM purchafe_safe WHERE verify_token = ${token} LIMIT 1`;
    if (!rows.length) return res.status(404).json({ valid: false, status: 'NOT_FOUND' });
    const record = rows[0];
    return res.status(200).json({ valid: record.status === 'ACTIVE', safeId: record.safe_id, factorySerial: record.factory_serial, merchantName: record.merchant_name, productName: record.product_name, purchaseDate: record.purchase_date, status: record.status, redeemedAt: record.redeemed_at });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to verify Purchafe Safe ID.' });
  }
};
