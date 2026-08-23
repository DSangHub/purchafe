# Purchafe Safe

Recovered Purchafe site plus a backend-ready point-of-purchase ownership verification flow.

## What is implemented
- Private random Purchafe Safe IDs (`PS-...`)
- QR verification links that do not expose owner PII
- Standards-based Code 128 barcode rendering in the browser
- Create, verify and single-use redeem API endpoints
- Neon/Postgres schema for ownership and purchase records
- Public verification page exposing only limited product/status information

## Database setup
1. Create or connect a Neon/Postgres database.
2. Run `schema.sql` in the database SQL editor.
3. Add `DATABASE_URL` to the deployment environment.
4. Add `PUBLIC_SITE_URL=https://www.purchafe.com` to production environment variables.

## API
- `POST /api/safe/create`
- `GET /api/safe/verify?token=...`
- `POST /api/safe/redeem`

## Security note
Owner name, address, notes and other private purchase details are stored server-side. They are not encoded into the Purchafe Safe QR or Code 128 barcode.

## Next production steps
Add authentication/authorization for retailer issuance and redemption, rate limiting, receipt/document storage, audit events, transfer workflow, stolen-item workflow, and POS partner API credentials before production use.
