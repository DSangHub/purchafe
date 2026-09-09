# Purchafe Safe

Recovered Purchafe site plus a backend-ready point-of-purchase ownership verification flow.

## What is implemented
- Private random Purchafe Safe IDs (`PS-...`)
- QR verification links that do not expose owner PII
- Standards-based Code 128 barcode rendering in the browser
- Authenticated merchant enrollment, purchase issuance and single-use redemption
- Idempotent POS order handling and merchant audit events
- Neon/Postgres schema for merchants, locations, ownership and purchase records
- Public verification page exposing only limited product/status information

## Database setup
1. Create or connect a Neon/Postgres database.
2. Run `schema.sql` in the database SQL editor.
3. Add `DATABASE_URL` to the deployment environment.
4. Add `PUBLIC_SITE_URL=https://www.purchafe.com` to production environment variables.
5. Add a strong `PURCHAFE_ADMIN_SECRET` to protect merchant enrollment.

## API
- `POST /api/merchants/enroll` (administrator only; returns the merchant API key once)
- `POST /api/merchant/purchases` (merchant POS; idempotent by merchant + order ID)
- `GET /api/safe/verify?token=...`
- `POST /api/safe/redeem` (merchant authenticated)

Merchant endpoints accept `Authorization: Bearer pk_live_...` or `X-Purchafe-Api-Key`.
Each POS order must send a stable `externalOrderId`; safe retries return the original Safe ID instead of creating duplicates.

Example POS request:
```bash
curl -X POST https://www.purchafe.com/api/merchant/purchases \
  -H 'Authorization: Bearer pk_live_REPLACE_ME' \
  -H 'Content-Type: application/json' \
  -d '{"externalOrderId":"ORDER-1001","externalLocationId":"main","ownerName":"Customer Name","purchaseDate":"2026-09-09","factorySerial":"012345678901","productName":"Laptop"}'
```

## Security note
Owner name, address, notes and other private purchase details are stored server-side. They are not encoded into the Purchafe Safe QR or Code 128 barcode. Merchant API keys are stored only as SHA-256 hashes.

## Next production steps
Before production, add platform rate limiting, receipt/document storage, key rotation, transfer and stolen-item workflows, and a merchant onboarding review.
