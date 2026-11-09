/* ============================================================
   WILDTHREAD — store.js
   Cart, wishlist and orders persisted in localStorage.
   Prices are NEVER trusted from storage — always re-read live
   from the catalogue (re-validation on load).
   ============================================================ */
window.WT = window.WT || {};

WT.store = (function () {
  var KEYS = { cart: "wt_cart", wishlist: "wt_wishlist", orders: "wt_orders", newsletter: "wt_newsletter", notify: "wt_notify_drop4" };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ }
    emit();
  }

  /* tiny pub/sub so badges/drawer/views stay in sync (incl. other tabs) */
  var subs = [];
  function emit() { subs.forEach(function (fn) { fn(); }); }
  function onChange(fn) { subs.push(fn); }

  /* ---------------- CART ----------------
     Line shape: { id, size, qty }  — colour is fixed per product (colors[0]).
     Same product in a different size = separate line. */
  function cart() {
    var lines = read(KEYS.cart, []);
    /* re-validate against catalogue: drop dead products, clamp qty to stock */
    if (!WT.data.ready) return lines;
    var changed = false;
    lines = lines.filter(function (l) {
      var p = WT.data.byId(l.id);
      if (!p || p.sizes.indexOf(l.size) === -1) { changed = true; return false; }
      var max = p.stock[l.size] || 0;
      if (l.qty > max) { l.qty = max; changed = true; }
      if (l.qty <= 0) { changed = true; return false; }
      return true;
    });
    if (changed) write(KEYS.cart, lines);
    return lines;
  }

  function addToCart(id, size, qty) {
    var p = WT.data.byId(id);
    if (!p) return { ok: false, reason: "unknown" };
    qty = qty || 1;
    if (!size || p.sizes.indexOf(size) === -1) return { ok: false, reason: "size" };
    var max = p.stock[size] || 0;
    if (max <= 0) return { ok: false, reason: "oos" };
    var lines = cart();
    var line = lines.find(function (l) { return l.id === id && l.size === size; });
    var cur = line ? line.qty : 0;
    if (cur + qty > max) {
      if (line) { line.qty = max; write(KEYS.cart, lines); }
      return { ok: false, reason: "max", max: max };
    }
    if (line) line.qty += qty; else lines.push({ id: id, size: size, qty: qty });
    write(KEYS.cart, lines);
    return { ok: true };
  }

  function setQty(id, size, qty) {
    var p = WT.data.byId(id);
    var max = p ? (p.stock[size] || 0) : 0;
    var lines = cart();
    var line = lines.find(function (l) { return l.id === id && l.size === size; });
    if (!line) return;
    line.qty = Math.max(0, Math.min(qty, max));
    if (line.qty === 0) lines = lines.filter(function (l) { return l !== line; });
    write(KEYS.cart, lines);
  }

  function removeLine(id, size) {
    write(KEYS.cart, cart().filter(function (l) { return !(l.id === id && l.size === size); }));
  }

  function clearCart() { write(KEYS.cart, []); }

  function cartCount() {
    return cart().reduce(function (n, l) { return n + l.qty; }, 0);
  }

  /* Totals — computed live from catalogue prices */
  function totals(couponCode) {
    var subtotal = cart().reduce(function (sum, l) {
      var p = WT.data.byId(l.id);
      return sum + (p ? p.price * l.qty : 0);
    }, 0);
    var discount = 0;
    if (couponCode && couponCode.trim().toUpperCase() === WT.config.coupon.code) {
      discount = Math.round(subtotal * WT.config.coupon.pct / 100);
    }
    var shipping = subtotal === 0 ? 0 : (subtotal - discount >= WT.config.freeShippingAbove ? 0 : WT.config.shippingFee);
    return { subtotal: subtotal, discount: discount, shipping: shipping, total: subtotal - discount + shipping };
  }

  /* ---------------- WISHLIST ---------------- */
  function wishlist() {
    var ids = read(KEYS.wishlist, []);
    if (!WT.data.ready) return ids;
    return ids.filter(function (id) { return !!WT.data.byId(id); });
  }
  function inWishlist(id) { return wishlist().indexOf(id) !== -1; }
  function toggleWishlist(id) {
    var list = wishlist();
    var i = list.indexOf(id);
    if (i === -1) list.push(id); else list.splice(i, 1);
    write(KEYS.wishlist, list);
    return i === -1; /* true = added */
  }

  /* ---------------- ORDERS ---------------- */
  function orders() { return read(KEYS.orders, []); }
  function saveOrder(order) {
    var list = orders();
    list.push(order);
    write(KEYS.orders, list);
  }
  function orderById(id) {
    return orders().find(function (o) { return o.id === id; }) || null;
  }

  /* ---------------- cross-tab sync ---------------- */
  window.addEventListener("storage", function (e) {
    if (e.key === KEYS.cart || e.key === KEYS.wishlist || e.key === KEYS.orders) emit();
  });

  return {
    KEYS: KEYS, onChange: onChange,
    cart: cart, addToCart: addToCart, setQty: setQty, removeLine: removeLine,
    clearCart: clearCart, cartCount: cartCount, totals: totals,
    wishlist: wishlist, inWishlist: inWishlist, toggleWishlist: toggleWishlist,
    orders: orders, saveOrder: saveOrder, orderById: orderById,
    read: read, write: write
  };
})();
