# Backend Quick Reference

## Admin Login

The gateway issues JWTs for any credentials you supply, but the admin UI and sample requests assume this account:

- **Email:** `flora.admin@example.com`
- **Password:** `secret123`

Use it when running the frontend admin console (`bun dev` in `frontend/`). The token returned from `POST /auth/login` carries the email in the payload and is required for managing categories, products, option groups, and options through the gateway.

## Helpful Endpoints

| Service  | Purpose                  | Endpoint examples (gateway)               |
|----------|--------------------------|-------------------------------------------|
| Auth     | Obtain JWT               | `POST /auth/login`                        |
| Products | CRUD products            | `GET /products`, `POST /products`         |
| Catalog  | Manage categories        | `GET /categories`, `POST /categories`     |
| Options  | Manage option groups/items | `POST /option-groups`, `POST /options`  |

Make sure the relevant services are up via `docker compose up` (or individual `npm run start:dev`) before calling these endpoints.

## Product Creation Template

Use this JSON as a starting point when creating new products via Postman or the admin console:

```json
{
  "category": {
    "name": "Wedding Bouquets",
    "description": "Premium bouquets perfect for ceremonies."
  },
  "product": {
    "name": "Rose Aurora Arrangement",
    "description": "A bouquet of 24 roses with eucalyptus accents.",
    "basePrice": 2590,
    "imageUrl": "https://cdn.example.com/products/rose-aurora.jpg"
  },
  "optionGroups": [
    {
      "name": "Packaging",
      "description": "Choose wrapping style",
      "isRequired": true,
      "minSelect": 1,
      "maxSelect": 1,
      "options": [
        {
          "name": "Luxury Gift Box",
          "description": "Rigid box with satin ribbon",
          "priceModifier": 450
        },
        {
          "name": "Eco Kraft Wrap",
          "description": "Sustainable kraft wrap",
          "priceModifier": 120
        }
      ]
    },
    {
      "name": "Message Card",
      "description": "Add a personal note",
      "isRequired": false,
      "minSelect": 0,
      "maxSelect": 1,
      "options": [
        {
          "name": "Standard Card",
          "description": "Classic white card",
          "priceModifier": 0
        },
        {
          "name": "Custom Printed",
          "description": "Custom design and message",
          "priceModifier": 80
        }
      ]
    }
  ]
}
```

Template copy: `frontend/templates/product-template.json`
