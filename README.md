# FloraTailor

## Sample accounts and roles

The local authentication stub accepts any password and determines your permissions from the email address that you enter. Use the following test identities to explore the storefront and dashboard:

| Email | Role | Capabilities |
| --- | --- | --- |
| `flora.owner@example.com` | Store owner | Full dashboard access, can add and edit catalog content, can view customer orders, **cannot** place orders from the storefront. |
| `flora.admin@example.com` | Administrator | Dashboard access in read-only mode (view catalog, products, and customers) and can place orders like a shopper. |
| `flora.customer@example.com` | Customer | Standard shopping experience: browse products, place orders, and view order history. |

All other email addresses are treated as regular customers.

## Development quick start

1. Install dependencies: `npm install`
2. Run the development servers with `docker compose up`
3. Open the frontend at http://localhost:5173 and sign in using one of the sample accounts above.
