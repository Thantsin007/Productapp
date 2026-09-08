const express = require("express");
const fetch = require("node-fetch"); // v2 - CommonJS compatible
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = "https://dummyjson.com";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Simple in-memory cache so we don't hit the API on every request while
// the user is typing/searching. Refreshes every 5 minutes.
let cache = { data: null, fetchedAt: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getAllProducts() {
  const now = Date.now();
  if (cache.data && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }
  // dummyjson has 194 products total; limit=0 returns all of them.
  const res = await fetch(`${API_BASE}/products?limit=0`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  cache = { data: json.products, fetchedAt: now };
  return cache.data;
}

// Filters products by id, name (title), or detail (description).
function filterProducts(products, query) {
  if (!query || !query.trim()) return products;
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    const idMatch = String(p.id) === q || String(p.id).includes(q);
    const nameMatch = p.title && p.title.toLowerCase().includes(q);
    const detailMatch =
      p.description && p.description.toLowerCase().includes(q);
    return idMatch || nameMatch || detailMatch;
  });
}

// GET / -> list + search
app.get("/", async (req, res) => {
  try {
    const query = req.query.q || "";
    const allProducts = await getAllProducts();
    const products = filterProducts(allProducts, query);
    res.render("product", {
      products,
      query,
      total: allProducts.length,
      resultCount: products.length,
      error: null,
    });
  } catch (err) {
    res.render("product", {
      products: [],
      query: req.query.q || "",
      total: 0,
      resultCount: 0,
      error: "Could not load products from the API. Please try again.",
    });
  }
});

// GET /product/:id -> detail page
app.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${API_BASE}/products/${id}`);
    if (!response.ok) {
      return res.status(404).render("product-detail", {
        product: null,
        error: "Product not found.",
      });
    }
    const product = await response.json();
    res.render("product-detail", { product, error: null });
  } catch (err) {
    res.status(500).render("product-detail", {
      product: null,
      error: "Could not load this product. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
