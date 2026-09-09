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

CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','CLOSED')),
  api_key_hash CHAR(64) UNIQUE NOT NULL,
  webhook_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_locations (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  external_location_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, external_location_id)
);

ALTER TABLE purchafe_safe ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES merchants(id);
ALTER TABLE purchafe_safe ADD COLUMN IF NOT EXISTS merchant_location_id UUID REFERENCES merchant_locations(id);
ALTER TABLE purchafe_safe ADD COLUMN IF NOT EXISTS external_order_id TEXT;
ALTER TABLE purchafe_safe ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE purchafe_safe ADD COLUMN IF NOT EXISTS product_sku TEXT;
ALTER TABLE purchafe_safe ADD COLUMN IF NOT EXISTS redeemed_by_merchant_id UUID REFERENCES merchants(id);

CREATE UNIQUE INDEX IF NOT EXISTS purchafe_safe_merchant_order_idx
  ON purchafe_safe(merchant_id, external_order_id)
  WHERE merchant_id IS NOT NULL AND external_order_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS merchant_audit_events (
  id BIGSERIAL PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id),
  event_type TEXT NOT NULL,
  safe_id VARCHAR(32),
  external_order_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS purchafe_safe_factory_serial_idx ON purchafe_safe(factory_serial);
CREATE INDEX IF NOT EXISTS purchafe_safe_status_idx ON purchafe_safe(status);
CREATE INDEX IF NOT EXISTS merchant_audit_events_merchant_idx ON merchant_audit_events(merchant_id, created_at DESC);
