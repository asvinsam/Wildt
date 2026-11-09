/* ============================================================
   WILDTHREAD — checkout.js
   #/checkout: address form, inline validation, order summary,
   Place Order → POST /api/orders (local server) with silent
   localStorage fallback → confirmation at #/order/:id
   Plain script — attaches to window.WT.checkout
   ============================================================ */
(function () {
  "use strict";
  window.WT = window.WT || {};

  var checkout = {};
  WT.checkout = checkout;

  var STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh"
  ];

  function field(id, label, opts) {
    opts = opts || {};
    return '<div class="co-field' + (opts.half ? " co-field--half" : "") + '" data-field="' + id + '">' +
      '<label for="co-' + id + '">' + label + (opts.req === false ? ' <span class="opt">(optional)</span>' : "") + "</label>" +
      (opts.select
        ? '<select id="co-' + id + '" name="' + id + '"' + (opts.req === false ? "" : " required") + '>' +
          '<option value="">Select state</option>' + STATES.map(function (s) { return "<option>" + s + "</option>"; }).join("") + "</select>"
        : '<input id="co-' + id + '" name="' + id + '" type="' + (opts.type || "text") + '"' +
          (opts.attrs ? " " + opts.attrs : "") + (opts.req === false ? "" : " required") + ">") +
      '<p class="err" id="co-' + id + '-err" role="alert" hidden></p>' +
      "</div>";
  }

  checkout.view = function () {
    var cart = WT.store.cart();
    if (!cart.length) {
      var emptyHtml = '<section class="route" aria-labelledby="route-title"><div class="empty-state empty-state--tall">' +
        '<p class="empty-state__big" id="route-title">Nothing to check out yet.</p>' +
        "<p>Your cart is empty — go grab something loud.</p>" +
        '<a class="btn btn--acid" href="#/#new">Shop new arrivals</a></div></section>';
      WT.router.showRoute(emptyHtml, "Checkout", ".empty-state__big");
      return;
    }

    var t = WT.store.totals(WT.ui._coupon);

    var summaryItems = cart.map(function (line) {
      var p = WT.data.byId(line.id);
      if (!p) return "";
      return '<li class="co-sum-item">' +
        '<img src="' + WT.esc(WT.ui.img(p.images[0])) + '" alt="" width="52" height="65" loading="lazy">' +
        '<span><strong>' + WT.esc(p.name) + "</strong><em>Size " + WT.esc(line.size) + " × " + line.qty + "</em></span>" +
        "<b>" + WT.money(p.price * line.qty) + "</b></li>";
    }).join("");

    var html = "" +
    '<section class="route route--checkout" aria-labelledby="route-title">' +
      WT.router.crumb([{ label: "Home", href: "#/" }, { label: "Checkout" }]) +
      '<h1 class="route__title" id="route-title">Checkout</h1>' +
      '<p class="demo-note">' + WT.ui.ICONS.tag + " Demo checkout: no payment is taken.</p>" +
      '<form class="co-layout" id="checkout-form" novalidate>' +
        '<div class="co-main">' +
          '<fieldset class="co-sec"><legend>Contact</legend>' +
            '<div class="co-row">' +
              field("name", "Full name", { half: true, attrs: 'autocomplete="name"' }) +
              field("email", "Email", { half: true, type: "email", attrs: 'autocomplete="email"' }) +
            "</div>" +
            '<div class="co-row">' +
              field("phone", "Mobile (10 digits)", { half: true, type: "tel", attrs: 'autocomplete="tel" inputmode="numeric" maxlength="10" placeholder="98XXXXXXXX"' }) +
            "</div>" +
          "</fieldset>" +
          '<fieldset class="co-sec"><legend>Delivery address</legend>' +
            field("address", "Address (house, street, area)", { attrs: 'autocomplete="street-address"' }) +
            '<div class="co-row">' +
              field("city", "City", { half: true, attrs: 'autocomplete="address-level2"' }) +
              field("state", "State", { half: true, select: true }) +
            "</div>" +
            '<div class="co-row">' +
              field("pin", "PIN code (6 digits)", { half: true, attrs: 'inputmode="numeric" maxlength="6" autocomplete="postal-code"' }) +
            "</div>" +
          "</fieldset>" +
          '<fieldset class="co-sec"><legend>Payment</legend>' +
            '<label class="pay-opt"><input type="radio" name="payment" value="cod" checked>' +
              '<span><strong>Cash on delivery</strong><em>Pay when the drop lands.</em></span></label>' +
            '<label class="pay-opt"><input type="radio" name="payment" value="online">' +
              '<span><strong>Pay online (demo)</strong><em>Simulated only — no real payment, no card needed.</em></span></label>' +
          "</fieldset>" +
        "</div>" +
        '<aside class="co-summary" aria-label="Order summary">' +
          '<h2>Order summary</h2>' +
          "<ul>" + summaryItems + "</ul>" +
          '<dl class="totals">' +
            "<div><dt>Subtotal</dt><dd>" + WT.money(t.subtotal) + "</dd></div>" +
            (t.discount > 0 ? '<div class="totals__off"><dt>Coupon ' + WT.esc(WT.config.coupon.code) + "</dt><dd>−" + WT.money(t.discount) + "</dd></div>" : "") +
            "<div><dt>Shipping</dt><dd>" + (t.shipping === 0 ? "FREE" : WT.money(t.shipping)) + "</dd></div>" +
            '<div class="totals__grand"><dt>Total</dt><dd>' + WT.money(t.total) + "</dd></div>" +
          "</dl>" +
          '<button class="btn btn--acid btn--block" type="submit" id="place-order">Place Order ' + WT.ui.ICONS.arrowR + "</button>" +
          '<p class="co-note">By placing this demo order you agree to look extremely good.</p>' +
        "</aside>" +
      "</form>" +
    "</section>";

    WT.router.showRoute(html, "Checkout", "#route-title");
    bind();
  };

  function setErr(id, msg) {
    var wrap = document.querySelector('[data-field="' + id + '"]');
    if (!wrap) return !msg;
    var err = wrap.querySelector(".err");
    var input = wrap.querySelector("input, select");
    if (msg) {
      wrap.classList.add("has-err");
      if (err) { err.textContent = msg; err.hidden = false; }
      if (input) input.setAttribute("aria-invalid", "true");
      return false;
    }
    wrap.classList.remove("has-err");
    if (err) { err.textContent = ""; err.hidden = true; }
    if (input) input.removeAttribute("aria-invalid");
    return true;
  }

  var RULES = {
    name: function (v) { return v.trim().length >= 2 ? "" : "Tell us your name (2+ characters)."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "That email doesn't look right."; },
    phone: function (v) { return /^[6-9]\d{9}$/.test(v.trim()) ? "" : "Enter a valid 10-digit Indian mobile (starts 6–9)."; },
    address: function (v) { return v.trim().length >= 8 ? "" : "Add a full address — house, street, area."; },
    city: function (v) { return v.trim().length >= 2 ? "" : "City is required."; },
    state: function (v) { return v ? "" : "Pick your state."; },
    pin: function (v) { return /^[1-9]\d{5}$/.test(v.trim()) ? "" : "PIN code is 6 digits (can't start with 0)."; }
  };

  function bind() {
    var form = document.getElementById("checkout-form");
    if (!form) return;

    Object.keys(RULES).forEach(function (id) {
      var input = document.getElementById("co-" + id);
      if (!input) return;
      input.addEventListener("blur", function () { setErr(id, RULES[id](input.value)); });
      input.addEventListener("input", function () {
        var wrap = input.closest(".co-field");
        if (wrap && wrap.classList.contains("has-err")) setErr(id, RULES[id](input.value));
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(RULES).forEach(function (id) {
        var input = document.getElementById("co-" + id);
        var ok = setErr(id, RULES[id](input ? input.value : ""));
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) {
        firstBad.focus();
        WT.ui.toast("A couple of fields need attention.", "warn");
        return;
      }
      placeOrder(form);
    });
  }

  function orderId() {
    var d = new Date();
    var stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    var rand = Math.floor(1000 + Math.random() * 9000);
    return "WT-" + stamp + "-" + rand;
  }

  function eta() {
    var a = new Date(Date.now() + 3 * 86400000);
    var b = new Date(Date.now() + 6 * 86400000);
    var opts = { day: "numeric", month: "short" };
    return a.toLocaleDateString("en-IN", opts) + " – " + b.toLocaleDateString("en-IN", opts);
  }

  function buildOrder(form) {
    var cart = WT.store.cart();
    var t = WT.store.totals(WT.ui._coupon);
    var pay = form.querySelector('input[name="payment"]:checked');
    return {
      id: orderId(),
      placedAt: new Date().toISOString(),
      customer: {
        name: val("name"), email: val("email"), phone: val("phone"),
        address: val("address"), city: val("city"), state: val("state"), pin: val("pin")
      },
      payment: pay ? pay.value : "cod",
      items: cart.map(function (line) {
        var p = WT.data.byId(line.id);
        return p ? { id: p.id, name: p.name, size: line.size, color: p.colors[0].name, price: p.price, qty: line.qty } : null;
      }).filter(Boolean),
      coupon: WT.ui._coupon || null,
      totals: t,
      eta: eta()
    };
    function val(id) { var el = document.getElementById("co-" + id); return el ? el.value.trim() : ""; }
  }

  /* Try the local Express server (POST /api/orders). On any failure —
     static hosting included — silently fall back to localStorage. */
  function sendToApi(order) {
    return fetch("api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    }).then(function (r) {
      if (!r.ok) throw new Error("api " + r.status);
      return r.json().catch(function () { return { ok: true }; });
    }).then(function () { return true; })
      .catch(function () { return false; });
  }

  function placeOrder(form) {
    var btn = document.getElementById("place-order");
    if (btn) { btn.disabled = true; btn.textContent = "Placing order…"; }

    /* Re-validate stock against live catalogue before placing. */
    var problems = [];
    WT.store.cart().forEach(function (line) {
      var p = WT.data.byId(line.id);
      var st = p && p.stock ? (p.stock[line.size] || 0) : 0;
      if (!p || st < line.qty) problems.push((p ? p.name : "An item") + " (" + line.size + ")");
    });
    if (problems.length) {
      WT.ui.toast("Stock changed: " + problems.join(", ") + ". Review your cart.", "warn");
      WT.ui.renderCart();
      WT.ui.openCart();
      if (btn) { btn.disabled = false; btn.innerHTML = "Place Order " + WT.ui.ICONS.arrowR; }
      return;
    }

    var order = buildOrder(form);

    sendToApi(order).then(function (savedServerSide) {
      /* localStorage is always written — it's the confirmation source */
      WT.store.saveOrder(order);
      WT.store.clearCart();
      WT.ui._coupon = null;
      WT.ui._couponMsg = "";
      WT.ui.updateBadges();
      location.hash = "#/order/" + order.id;
    });
  }
})();
