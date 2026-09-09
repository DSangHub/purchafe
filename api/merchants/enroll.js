const crypto = require('crypto');
const { db } = require('../_db');
const { hashApiKey } = require('../_merchantAuth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const adminSecret = String(req.headers['x-purchafe-admin-secret'] || '');
  if (!process.env.PURCHAFE_ADMIN_SECRET || adminSecret !== process.env.PURCHAFE_ADMIN_SECRET) {
    return res.status(401).json({ error: 'Administrator authorization required.' });
  }

  try {
    const { name, externalLocationId = 'main', locationName = 'Main location', webhookUrl } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Merchant name required.' });
    const merchantId = crypto.randomUUID();
    const locationId = crypto.randomUUID();
    const apiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;
    const sql = db();
    await sql.transaction([
      sql`INSERT INTO merchants (id, name, api_key_hash, webhook_url) VALUES (${merchantId}, ${String(name).trim()}, ${hashApiKey(apiKey)}, ${webhookUrl || null})`,
      sql`INSERT INTO merchant_locations (id, merchant_id, external_location_id, name) VALUES (${locationId}, ${merchantId}, ${String(externalLocationId)}, ${String(locationName)})`
    ]);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(201).json({ merchantId, locationId, apiKey, message: 'Save this API key now. It will not be shown again.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to enroll merchant.' });
  }
};
