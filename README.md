# Product Catalog (Express + EJS + DummyJSON API)

A small web app that fetches product data from the [DummyJSON Products API](https://dummyjson.com/products)
and displays it with two EJS views:

- **`views/product.ejs`** — the main catalog page with a search bar that filters products by **ID**, **name (title)**, or **detail (description)**.
- **`views/product-detail.ejs`** — a single product's detail screen (images, price, stock, reviews, etc.), fetched from `https://dummyjson.com/products/:id`.

## Project structure

```
product-app/
├── server.js               # Express server + routes
├── package.json
├── views/
│   ├── product.ejs         # list + search screen
│   └── product-detail.ejs  # single product screen
└── public/
    └── css/
        └── style.css        # UI styling
```

## How it works

- `GET /` — fetches all products (`GET https://dummyjson.com/products?limit=0`), caches them in memory for
  5 minutes, and filters them server-side based on the `?q=` query string. A product matches if the search
  text appears in its **id**, **title**, or **description**.
- `GET /product/:id` — fetches a single product (`GET https://dummyjson.com/products/:id`) and renders the
  detail screen. Returns a friendly "not found" message for invalid IDs.

## Setup

1. Install dependencies:
   ```bash
   cd product-app
   npm install
   ```
2. Run the app:
   ```bash
   npm start
   ```
3. Open your browser at [http://localhost:3000](http://localhost:3000).

## Search examples

- `1` → matches products whose ID contains "1" (e.g. id 1, 10, 11...) or whose title/description mentions "1"
- `phone` → matches any product with "phone" in the title or description
- `essence` → matches by description keyword

## Notes

- Requires an internet connection since data is fetched live from `https://dummyjson.com`.
- Node 16+ recommended (uses `node-fetch@2`, which is CommonJS-compatible).
