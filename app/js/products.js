/* ============================================================
   WILDTHREAD — products.js
   Brand config + catalogue loading. Change the brand in ONE place.
   ============================================================ */
window.WT = window.WT || {};

/* ---- Brand / store config (client-editable) ---- */
WT.config = {
  brand: "WILDTHREAD",
  tagline: "Wear the noise.",
  currency: "₹",
  freeShippingAbove: 999,
  shippingFee: 79,
  coupon: { code: "WILD10", pct: 10 },
  drop: { name: "DROP 04: NIGHT RIDER", date: "2026-11-15T00:00:00+05:30" },
  placeholderImg: "assets/icons/placeholder.svg"
};

/* ---- Categories (order matters for the grid) ---- */
WT.CATEGORIES = [
  { slug: "t-shirts",    label: "T-Shirts",    type: "t-shirt" },
  { slug: "hoodies",     label: "Hoodies",     type: "hoodie" },
  { slug: "jeans",       label: "Jeans",       type: "jeans" },
  { slug: "joggers",     label: "Joggers",     type: "jogger" },
  { slug: "cargos",      label: "Cargos",      type: "cargo" },
  { slug: "accessories", label: "Accessories", type: "accessory" }
];

/* Category tile images — every photo shows that exact garment on a model:
   t-shirts.jpg    : model wearing a white oversized graphic tee
   hoodies.jpg     : model wearing a beige oversized hoodie on the street
   jeans.jpg       : model wearing light-blue slim jeans
   joggers.jpg     : model wearing a yellow jogger co-ord set
   cargos.jpg      : model wearing olive cargo pants
   accessories.jpg : model wearing a beige bucket hat + black tee */
WT.CATEGORY_IMAGES = {
  "t-shirts":    "assets/categories/t-shirts.jpg",
  "hoodies":     "assets/categories/hoodies.jpg",
  "jeans":       "assets/categories/jeans.jpg",
  "joggers":     "assets/categories/joggers.jpg",
  "cargos":      "assets/categories/cargos.jpg",
  "accessories": "assets/categories/accessories.jpg"
};

/* ---- Catalogue store ---- */
WT.data = {
  products: [],
  ready: false,

  /* Loads the catalogue. Returns a promise. */
  load() {
    /* file:// pages cannot fetch() local files, so use the copy in
       data/products-data.js (window.WT_PRODUCTS) when opened directly */
    if (location.protocol === "file:" && Array.isArray(window.WT_PRODUCTS)) {
      WT.data.products = window.WT_PRODUCTS;
      WT.data.ready = true;
      return Promise.resolve(WT.data.products);
    }
    return fetch("data/products.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (list) {
        WT.data.products = list;
        WT.data.ready = true;
        return list;
      });
  },

  all() { return WT.data.products; },

  byId(id) {
    return WT.data.products.find(function (p) { return p.id === id; }) || null;
  },

  byCategory(slug) {
    return WT.data.products.filter(function (p) { return p.category === slug; });
  },

  byType(type) {
    return WT.data.products.filter(function (p) { return p.type === type; });
  },

  tagged(tag) {
    return WT.data.products.filter(function (p) { return p.tags.indexOf(tag) !== -1; });
  },

  categoryLabel(slug) {
    var c = WT.CATEGORIES.find(function (c) { return c.slug === slug; });
    return c ? c.label : slug;
  },

  countFor(slug) { return WT.data.byCategory(slug).length; },

  inStock(p, size) {
    if (!p) return false;
    if (size) return (p.stock[size] || 0) > 0;
    return p.sizes.some(function (s) { return (p.stock[s] || 0) > 0; });
  },

  totalStock(p) {
    return p.sizes.reduce(function (n, s) { return n + (p.stock[s] || 0); }, 0);
  },

  discountPct(p) {
    return Math.round((1 - p.price / p.mrp) * 100);
  }
};

/* ---- money formatting ---- */
WT.money = function (n) {
  return WT.config.currency + Number(n).toLocaleString("en-IN");
};

/* ---- tiny HTML escaper — used for ALL dynamic text ---- */
WT.esc = function (s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};