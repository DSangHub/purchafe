const crypto = require('crypto');
const { db } = require('./_db');

function hashApiKey(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readApiKey(req) {
  const authorization = String(req.headers.authorization || '');
  if (authorization.startsWith('Bearer ')) return authorization.slice(7).trim();
  return String(req.headers['x-purchafe-api-key'] || '').trim();
}

async function requireMerchant(req, res) {
  const apiKey = readApiKey(req);
  if (!apiKey || !apiKey.startsWith('pk_live_')) {
    res.status(401).json({ error: 'Valid merchant API key required.' });
    return null;
  }

  const sql = db();
  const rows = await sql`SELECT id, name, status FROM merchants WHERE api_key_hash = ${hashApiKey(apiKey)} LIMIT 1`;
  if (!rows.length || rows[0].status !== 'ACTIVE') {
    res.status(401).json({ error: 'Merchant API key is invalid or inactive.' });
    return null;
  }
  return rows[0];
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim().slice(0, 80);
}

module.exports = { hashApiKey, requireMerchant, clientIp };
