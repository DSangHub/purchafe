const crypto = require('crypto');
const { db } = require('../_db');
const { requireMerchant, clientIp } = require('../_merchantAuth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const merchant = await requireMerchant(req, res);
    if (!merchant) return;
    const { externalOrderId, externalLocationId = 'main', ownerName, ownerAddress, purchaseDate, purchaseAmount, factorySerial, productName, productSku, notes } = req.body || {};
    if (!externalOrderId || !ownerName || !purchaseDate || !factorySerial) {
      return res.status(400).json({ error: 'externalOrderId, ownerName, purchaseDate and factorySerial are required.' });
    }
    const sql = db();
    const existing = await sql`SELECT safe_id, verify_token, status FROM purchafe_safe WHERE merchant_id = ${merchant.id} AND external_order_id = ${String(externalOrderId)} LIMIT 1`;
    if (existing.length) return sendRecord(req, res, existing[0], false);
    const locations = await sql`SELECT id FROM merchant_locations WHERE merchant_id = ${merchant.id} AND external_location_id = ${String(externalLocationId)} LIMIT 1`;
    if (!locations.length) return res.status(400).json({ error: 'Merchant location is not registered.' });
    const safeId = `PS-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const verifyToken = crypto.randomBytes(24).toString('hex');
    const rows = await sql`INSERT INTO purchafe_safe
      (safe_id, verify_token, owner_name, owner_address, purchase_date, purchase_source, merchant_name, purchase_amount, factory_serial, notes, status, merchant_id, merchant_location_id, external_order_id, product_name, product_sku)
      VALUES (${safeId}, ${verifyToken}, ${String(ownerName).trim()}, ${ownerAddress || null}, ${purchaseDate}, 'Merchant POS', ${merchant.name}, ${purchaseAmount === '' || purchaseAmount == null ? null : Number(purchaseAmount)}, ${String(factorySerial).trim()}, ${notes || null}, 'ACTIVE', ${merchant.id}, ${locations[0].id}, ${String(externalOrderId)}, ${productName || null}, ${productSku || null})
      RETURNING safe_id, verify_token, status`;
    await sql`INSERT INTO merchant_audit_events (merchant_id, event_type, safe_id, external_order_id, ip_address, user_agent) VALUES (${merchant.id}, 'PURCHASE_CREATED', ${safeId}, ${String(externalOrderId)}, ${clientIp(req)}, ${String(req.headers['user-agent'] || '').slice(0, 500)})`;
    return sendRecord(req, res, rows[0], true);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to create merchant purchase record.' });
  }
};

function sendRecord(req, res, record, created) {
  const origin = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`;
  res.setHeader('Cache-Control', 'no-store');
  return res.status(created ? 201 : 200).json({
    created,
    safeId: record.safe_id,
    status: record.status,
    barcodeValue: record.safe_id,
    barcodeFormat: 'CODE128',
    verifyUrl: `${origin}/verify.html?token=${record.verify_token}`
  });
}
