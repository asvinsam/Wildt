# WILDTHREAD — Wear the noise.

A loud, playful, Gen-Z Indian streetwear storefront. Client prototype: 100% static site — HTML5 + CSS3 + vanilla JS (ES6+), no frameworks, no build step. Hash routing, localStorage cart/wishlist/orders, demo checkout.

**Stack:** HTML5 · CSS3 (custom properties, Grid, Flexbox, keyframes) · vanilla JS · optional GSAP + ScrollTrigger & Swiper via CDN (the site works fully without them) · optional local Express server for `POST /api/orders`.

---

## Run locally

No build step. Any static server works:

```bash
# from this folder
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed URL (e.g. http://localhost:3000).

> **Don't** open `index.html` directly from the file system (`file://`) — the catalogue is fetched from `data/products.json`, and browsers block `fetch` on `file://`. Any static server fixes it.

### Optional: local API for orders

```bash
npm install express
node server.js   # → http://localhost:3000
```

With the server running, **Place Order** also `POST`s to `/api/orders`, which validates the body, **recomputes totals from `data/products.json`** (client prices are never trusted), and appends to `orders.json`. Without the server (e.g. on GitHub Pages) the same order is saved silently to `localStorage` — zero changes needed in the front end.

---

## Deploy to GitHub Pages

1. Create a repository on GitHub (e.g. `wildthread`) and push this folder:
   ```bash
   git init && git add -A && git commit -m "WILDTHREAD storefront"
   git branch -M main
   git remote add origin https://github.com/<you>/wildthread.git
   git push -u origin main
   ```
2. In the repo: **Settings → Pages**.
3. Under **Build and deployment**: Source = **Deploy from a branch**, Branch = **main**, folder = **/ (root)**. Save.
4. Wait ~1 minute, then visit `https://<you>.github.io/wildthread/`.

Notes:
- `.nojekyll` is included so GitHub Pages serves every folder as-is.
- All paths are **relative** (`assets/…`, `js/…`, `data/…`) — the site works from any sub-path.
- Routing is **hash-only** (`#/category/jeans`, `#/product/wt-j01`, …) so no server rewrites are needed and refresh/back always work on static hosting.
- Cart, wishlist, orders and newsletter signups live in the visitor's browser (`localStorage`) — nothing leaves the device. Checkout is a **demo**: no payment is taken.

---

## Project structure

```
index.html               # single HTML shell — all 11 home sections + route view
css/
  style.css              # design system + all components
  responsive.css         # breakpoints 480 / 768 / 1024 / 1440
js/
  products.js            # WT.config, categories, catalogue API, money/esc helpers
  store.js               # cart / wishlist / orders in localStorage (+ cross-tab sync)
  search.js              # smart search: parseQuery / matchProducts / getSuggestions (UMD — also testable in Node)
  ui.js                  # rendering, cart drawer, toasts, cursor, reveals, delegation
  router.js              # hash router: home, category, product, search, wishlist, order, 404
  checkout.js            # checkout form, validation, demo order placement
  main.js                # boot: load catalogue, init, loader, GSAP flourishes
data/
  products.json          # 48 products (8 per category × 6 categories)
assets/
  hero.jpg, drop.jpg, insta-1..6.jpg
  categories/            # 6 category tiles
  products/              # product imagery (front/back)
  icons/                 # favicon.svg, placeholder.svg
server.js                # OPTIONAL local server: static + POST /api/orders
.nojekyll                # GitHub Pages: serve folders as-is
README.md
```

---

## Smart search — how it works & test table

`js/search.js` tokenises the query, normalises case/plurals/punctuation, and resolves it against two dictionaries:

- **Colours:** blue (incl. navy, indigo, denim blue, sky, light/dark blue), black, white, grey/gray, olive/green, beige/cream/khaki, red/maroon, brown, pink, yellow…
- **Types:** jeans/jean/denim, t-shirt/tee/tshirt, hoodie/sweatshirt, joggers/trackpants, cargos/cargo pants, accessories/cap/bag/belt/socks…

Matching is **strict AND**: a colour + type query returns only products matching both. If a strict match exists, loose matching never kicks in. No match → a "you may also like" grid (same type in other colours → same colour in other types → best sellers) plus category links.

| Query | Expected result |
|---|---|
| `blue jeans` | Only blue jeans (light / mid / dark-indigo) |
| `Blue Jean` | Same as `blue jeans` (case/plural-insensitive) |
| `navy denim` | Blue jeans (navy→blue, denim→jeans) |
| `black jeans` | Only black jeans |
| `pink jeans` | No match → "Jeans in other colours" + "Pink styles" + best sellers |
| `blue` | All blue products across every type |
| `hoodie` | All 8 hoodies |
| `trackpants` | All 8 joggers |
| `xyz` | No match → best sellers |
| `sarees` | No match → best sellers (unknown type) |

Run the automated test suite (no dependencies):

```bash
node --input-type=module -e "…"   # see tests below, or run any assertion against:
const s = require('./js/search.js')  # UMD: works in Node and the browser
```

The search box shows a debounced (200 ms) dropdown with the top 5 results and the detected interpretation; **Enter** opens `#/search?q=…` with removable interpretation chips ("Colour: Blue · Type: Jeans") and an aria-live result count. Full keyboard support: ↑/↓ to move, Enter to open, Esc to close.

---

## Customising

### Swap product images
1. Drop your images into `assets/products/` (4:5 portrait looks best, e.g. 900×1125).
2. In `data/products.json`, update the product's `"images": ["front.jpg", "back.jpg"]`.
3. Filenames are relative to `assets/products/`. Missing files automatically fall back to `assets/icons/placeholder.svg`.

### Change prices / stock / products
Everything the site shows — prices, MRP, discount %, sizes, per-size stock, tags (`new` / `bestseller`), colours — comes from `data/products.json`. Edit and refresh; cart lines re-validate against the live catalogue on every load, so a price change applies even to items already in someone's cart. The optional server recomputes totals from this file too.

### Brand name, tagline, drop date, coupon, shipping
All in **one object** at the top of `js/products.js` (`WT.config`): brand, tagline, currency, free-shipping threshold, shipping fee, coupon code/percent, and the countdown drop date.

### Colours / fonts
CSS custom properties at the top of `css/style.css` (`--bg`, `--paper`, `--acid`, `--pink`, `--blue`, `--font-display`, …). Change once, applies everywhere.

---

## Manual test checklist

- [ ] Home loads with loader → hero animation → all 11 sections in order
- [ ] Nav: glass effect on scroll, mobile hamburger overlay, all links route without reload
- [ ] Search: run the full table above; dropdown keyboard navigation (arrows/Enter/Esc)
- [ ] Category pages: breadcrumb, filters (size/colour/price/stock), 4 sort modes, "Clear filters" empty state, browser back button
- [ ] Product card: hover swaps to back image, size select required before Add to Cart, Sold Out state (e.g. Shadow Stack Jeans)
- [ ] Product page: gallery thumbs, size chart modal (Esc/backdrop close), qty picker, Buy Now → checkout
- [ ] Cart drawer: qty stepper clamps at stock, remove, subtotal, free-shipping progress (₹999), coupon `WILD10` = 10% off, persists across reloads and open tabs
- [ ] Checkout: every field validates inline (name, email, 10-digit mobile, address, city, state, 6-digit PIN), Place Order → confirmation with order ID `WT-YYYYMMDD-XXXX`, cart cleared
- [ ] With `node server.js`: order also appears in `orders.json`; on static hosting it falls back to localStorage silently
- [ ] Wishlist: heart toggles everywhere stay in sync; `#/wishlist` shows saved items
- [ ] Countdown on the DROP 04 banner ticks every second
- [ ] Newsletter: invalid email shows inline error; valid email persists
- [ ] Resize to 375 px: no horizontal scroll, all tap targets ≥ 44 px
- [ ] `prefers-reduced-motion`: animations/cursor off
- [ ] Console: zero errors, zero failed requests

---

## Accessibility & SEO

Semantic landmarks, skip link, ARIA on icon buttons, focus-trapped cart drawer / mobile menu / modals with Esc, `aria-live` announcements for cart & search, visible focus states, WCAG-AA body contrast, 44 px tap targets. Meta description, Open Graph tags, SVG favicon. Images carry explicit `width`/`height` (no layout shift), lazy loading below the fold, and descriptive alt text.

---

## Photo credits

All product/model photography is used as **placeholder imagery for a client prototype** and must be replaced with the client's own shoot before commercial launch. Sources: Unsplash (images.unsplash.com), Vecteezy, Magnific, iStock/Getty, Cherrydeck, Vogue (UK/Arabia/India), Coofandy, Baker Miller Pink, NYTimes, Tom Tailor, Soar Running, Adobe Stock, Hoop Studios, Atlanta Branding Photographer, Ally Fashion, Shein, Techwear Official, Urbano Fashion, Amazon.in, Elle, Who What Wear, Grunge Mama, ASOS, Ford La Femme, The Pant Project. Thanks to every photographer and retailer — links available on request.

© 2026 WILDTHREAD. Demo storefront — no real orders, no real payments.
