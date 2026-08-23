const { neon } = require('@neondatabase/serverless');

function db() {
  const connectionString = process.env.PURCHAFE_POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('PURCHAFE_POSTGRES_URL is not configured');
  }
  return neon(connectionString);
}

module.exports = { db };
