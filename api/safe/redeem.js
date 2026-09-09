const { db } = require('../_db');
const { requireMerchant, clientIp } = require('../_merchantAuth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const merchant = await requireMerchant(req, res);
    if (!merchant) return;
    const { safeId } = req.body || {};
    if (!safeId) return res.status(400).json({ error: 'Safe ID required.' });
    const sql = db();
    const rows = await sql`UPDATE purchafe_safe SET status = 'REDEEMED', redeemed_at = NOW(), redeemed_by_merchant_id = ${merchant.id}, updated_at = NOW() WHERE safe_id = ${safeId} AND status = 'ACTIVE' RETURNING safe_id, status, redeemed_at`;
    if (!rows.length) return res.status(409).json({ redeemed: false, error: 'Safe ID is invalid or already redeemed.' });
    await sql`INSERT INTO merchant_audit_events (merchant_id, event_type, safe_id, ip_address, user_agent) VALUES (${merchant.id}, 'SAFE_ID_REDEEMED', ${safeId}, ${clientIp(req)}, ${String(req.headers['user-agent'] || '').slice(0, 500)})`;
    return res.status(200).json({ redeemed: true, safeId: rows[0].safe_id, status: rows[0].status, redeemedAt: rows[0].redeemed_at });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to redeem Purchafe Safe ID.' });
  }
};
