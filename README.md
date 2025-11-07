# FloraTailor

## Sample accounts and roles

The local authentication stub accepts **any** password and derives the signed-in role purely from the email. Use these curated accounts to exercise every permission level in the app:

| Email | Role | Highlights |
| --- | --- | --- |
| `flora.owner@example.com` | Store owner | Manages the flagship storefront, can edit all catalog resources, reviews every customer order, and is blocked from placing their own purchases. |
| `flora.owner.market@example.com` | Store owner | Second owner profile for multi-owner QA. Shares the same back-office powers and checkout restrictions as the main owner account. |
| `flora.admin@example.com` | Administrator | Shops like a customer, audits the catalog in read-only mode, and can open the in-app user directory to view all seeded logins. |
| `flora.customer@example.com` | Customer | Baseline shopper used for checkout flows and personal order history testing. |
| `flora.customer.guest@example.com` | Customer | Extra shopper to validate parallel carts and order histories. |

All other email addresses continue to be treated as standard customers.

## Development quick start

1. Install dependencies: `npm install`
2. Run the development servers with `docker compose up`
3. Open the frontend at http://localhost:5173 and sign in using one of the sample accounts above.
