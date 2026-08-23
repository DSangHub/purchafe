CREATE TABLE IF NOT EXISTS purchafe_safe (
  id BIGSERIAL PRIMARY KEY,
  safe_id VARCHAR(32) UNIQUE NOT NULL,
  verify_token VARCHAR(64) UNIQUE NOT NULL,
  owner_name TEXT NOT NULL,
  owner_address TEXT,
  purchase_date DATE NOT NULL,
  purchase_source TEXT,
  merchant_name TEXT,
  purchase_amount NUMERIC(12,2),
  factory_serial TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REDEEMED','STOLEN','VOID')),
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS purchafe_safe_factory_serial_idx ON purchafe_safe(factory_serial);
CREATE INDEX IF NOT EXISTS purchafe_safe_status_idx ON purchafe_safe(status);
