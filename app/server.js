/* ============================================================
   WILDTHREAD — server.js  (OPTIONAL, local demo only)
   Serves the static site + POST /api/orders:
     - validates the request body
     - recomputes totals from data/products.json (never trusts the client)
     - appends the order to orders.json
   The site is 100% static-first: on GitHub Pages this file is
   ignored and the front end falls back to localStorage silently.

   Run:  npm install express   →   node server.js   →   http://localhost:3000
   ============================================================ */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

let express = null;
try { express = require("express"); } catch (_) { /* fall through to plain http server */ }

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const PRODUCTS_FILE = path.join(ROOT, "data", "products.json");
const ORDERS_FILE = path.join(ROOT, "orders.json");

const FREE_SHIP_ABOVE = 999;
const SHIPPING_FEE = 79;
const COUPON = { code: "WILD10", pct: 10 };

function loadProducts() {
  const raw = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
  return Array.isArray(raw) ? raw : raw.products;
}

function readOrders() {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8")); }
  catch (_) { return []; }
}

function validOrder(body) {
  const errs = [];
  const c = body && body.customer;
  if (!c) errs.push("customer missing");
  else {
    if (!c.name || c.name.trim().length < 2) errs.push("name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email || "")) errs.push("email");
    if (!/^[6-9]\d{9}$/.test(String(c.phone || "").trim())) errs.push("phone");
    if (!c.address || c.address.trim().length < 8) errs.push("address");
    if (!c.city || c.city.trim().length < 2) errs.push("city");
    if (!c.state) errs.push("state");
    if (!/^[1-9]\d{5}$/.test(String(c.pin || "").trim())) errs.push("pin");
  }
  if (!Array.isArray(body.items) || !body.items.length) errs.push("items");
  if (body.payment && !["cod", "online"].includes(body.payment)) errs.push("payment");
  return errs;
}

/* Recompute totals server-side from products.json — the client's
   prices are never trusted. */
function recompute(body, catalogue) {
  const byId = new Map(catalogue.map((p) => [p.id, p]));
  const items = [];
  let subtotal = 0;
  for (const line of body.items) {
    const p = byId.get(line.id);
    const qty = Math.max(1, Math.min(9, parseInt(line.qty, 10) || 1));
    if (!p) return { error: `unknown product ${line.id}` };
    const stock = p.stock && p.stock[line.size] != null ? p.stock[line.size] : 0;
    if (stock < qty) return { error: `insufficient stock for ${p.name} (${line.size})` };
    items.push({ id: p.id, name: p.name, size: line.size, color: p.colors[0].name, price: p.price, qty });
    subtotal += p.price * qty;
  }
  const coupon = String(body.coupon || "").trim().toUpperCase() === COUPON.code ? COUPON.code : null;
  const discount = coupon ? Math.round((subtotal * COUPON.pct) / 100) : 0;
  const shipping = subtotal - discount >= FREE_SHIP_ABOVE ? 0 : SHIPPING_FEE;
  return { items, coupon, totals: { subtotal, discount, shipping, total: subtotal - discount + shipping } };
}

function handleOrders(req, res) {
  let raw = "";
  req.on("data", (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
  req.on("end", () => {
    let body;
    try { body = JSON.parse(raw); }
    catch (_) { res.writeHead(400, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ ok: false, error: "invalid JSON" })); }

    const errs = validOrder(body);
    if (errs.length) { res.writeHead(422, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ ok: false, error: "validation failed", fields: errs })); }

    const recomputed = recompute(body, loadProducts());
    if (recomputed.error) { res.writeHead(409, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ ok: false, error: recomputed.error })); }

    const order = {
      id: body.id || `WT-${Date.now()}`,
      placedAt: new Date().toISOString(),
      customer: body.customer,
      payment: body.payment || "cod",
      items: recomputed.items,
      coupon: recomputed.coupon,
      totals: recomputed.totals,
      eta: body.eta || null,
      source: "local-server"
    };
    const orders = readOrders();
    orders.push(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, orderId: order.id }));
  });
}

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2" };

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
}

if (express) {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.post("/api/orders", (req, res) => {
    const errs = validOrder(req.body);
    if (errs.length) return res.status(422).json({ ok: false, error: "validation failed", fields: errs });
    const recomputed = recompute(req.body, loadProducts());
    if (recomputed.error) return res.status(409).json({ ok: false, error: recomputed.error });
    const order = {
      id: req.body.id || `WT-${Date.now()}`,
      placedAt: new Date().toISOString(),
      customer: req.body.customer,
      payment: req.body.payment || "cod",
      items: recomputed.items,
      coupon: recomputed.coupon,
      totals: recomputed.totals,
      eta: req.body.eta || null,
      source: "local-server"
    };
    const orders = readOrders();
    orders.push(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.status(201).json({ ok: true, orderId: order.id });
  });
  app.use(express.static(ROOT));
  app.listen(PORT, () => console.log(`WILDTHREAD local → http://localhost:${PORT}`));
} else {
  http.createServer((req, res) => {
    if (req.method === "POST" && req.url.split("?")[0] === "/api/orders") return handleOrders(req, res);
    if (req.method === "GET") return serveStatic(req, res);
    res.writeHead(405); res.end("method not allowed");
  }).listen(PORT, () => console.log(`WILDTHREAD local → http://localhost:${PORT}  (no express — static + /api/orders only)`));
}
