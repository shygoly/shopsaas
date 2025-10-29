## EverShop “ebooks” Deployment Summary (2025-10-20)

### Timeline Highlights
- **05:31–05:33 UTC** – Latest successful GitHub Actions run (`18643164468`) for `shygoly/evershop-fly`.
- Fly.io app `evershop-fly-ebooks` now online at `https://evershop-fly-ebooks.fly.dev` (HTTP 200 check succeeds).

### What Was Done
- Triggered the `Deploy new EverShop instance` workflow repeatedly while addressing failures around:
  - missing Fly organization slug,
  - absent DB connection secrets for new child apps,
  - admin bootstrap command issues (`bash` shell, CLI entry point, required `--name` argument, quoting).
- Hardened the workflow:
  - a helper batches `flyctl secrets set` so all required secrets (DB, S3, admin creds, `NODE_CONFIG`) land in one call,
  - admin seeding now shells via `sh`, uses the official `evershop` CLI fallback, supplies the shop owner name, and escapes variables correctly,
  - failure log collection switched to `--no-tail`.
- After the fixes the workflow completed in ~78 s, provisioning two machines in region `sin` and creating the admin user automatically.

### Next Steps & Notes
- Admin credentials for this run: `admin-ebooks@shopsaas.dev / EbooksAdmin#2024`.
- If you rerun the workflow, ensure any previous Fly app with the same name is destroyed (current instance is active and healthy).
- Google OAuth testing for ShopSaaS is pending — supply test credentials if you want that flow exercised next.

### One-Command Automation
- Added `scripts/provision-shop.sh` to encapsulate the manual steps. Example:
  ```bash
  chmod +x scripts/provision-shop.sh
  scripts/provision-shop.sh \
    --app evershop-fly-ebooks \
    --shop "ebooks" \
    --email admin-ebooks@shopsaas.dev \
    --password 'EbooksAdmin#2024'
  ```
- Flags: `--force-destroy` removes an existing Fly app before redeploying; `--check-only` reports current status without running the workflow.
