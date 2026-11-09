/* ============================================================
   WILDTHREAD — ui.js
   DOM rendering & interactions: cards, tiles, home grid, tabs,
   countdown, cart drawer, toasts, cursor, magnets, tilt, reveal,
   newsletter, search dropdown, focus traps, global delegation.
   Plain script — attaches to window.WT.ui
   ============================================================ */
(function () {
  "use strict";
  window.WT = window.WT || {};

  var ui = {};
  WT.ui = ui;

  /* ---------- tiny DOM helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  ui.$ = $; ui.$$ = $$;

  /* ---------- image path helpers ---------- */
  ui.img = function (file) {
    var ph = (WT.config && WT.config.placeholderImg) || "assets/icons/placeholder.svg";
    /* products.json stores full relative paths (assets/products/…) */
    return file || ph;
  };
  ui.catImg = function (slug) {
    return (WT.CATEGORY_IMAGES || {})[slug] || ((WT.config && WT.config.placeholderImg) || "");
  };

  /* ---------- global image fallback (capture phase) ---------- */
  function armImageFallback() {
    document.addEventListener("error", function (e) {
      var t = e.target;
      if (t && t.tagName === "IMG" && !t.dataset.fbk) {
        t.dataset.fbk = "1";
        t.src = (WT.config && WT.config.placeholderImg) || "assets/icons/placeholder.svg";
      }
    }, true);
  }

  /* ---------- SVG icon set (inline, reusable) ---------- */
  var ICONS = {
    heart: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    heartFill: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    trash: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4m6 6-6-6 6-6"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>',
    truck: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 8h13v9H1zM14 11h4l4 4v2h-8z"/><circle cx="6" cy="19" r="1.8"/><circle cx="18" cy="19" r="1.8"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 12.5 5 5L20 6.5"/></svg>',
    tag: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 13.4 11 3.8A2 2 0 0 0 9.6 3H4a1 1 0 0 0-1 1v5.6c0 .5.2 1 .6 1.4l9.6 9.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.6z"/><circle cx="8" cy="8" r="1.4"/></svg>'
  };
  ui.ICONS = ICONS;

  /* ---------- toasts ---------- */
  ui.toast = function (msg, kind) {
    var host = $("#toasts");
    if (!host) return;
    var t = document.createElement("div");
    t.className = "toast toast--" + (kind || "ok");
    t.setAttribute("role", "status");
    t.innerHTML = '<span class="toast__dot" aria-hidden="true"></span><span class="toast__msg"></span>';
    t.querySelector(".toast__msg").textContent = msg;
    host.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("is-in"); });
    setTimeout(function () {
      t.classList.add("is-out");
      setTimeout(function () { t.remove(); }, 450);
    }, 2600);
    while (host.children.length > 4) host.firstChild.remove();
  };

  ui.announce = function (msg) {
    var a = $("#sr-announcer");
    if (!a) return;
    a.textContent = "";
    setTimeout(function () { a.textContent = msg; }, 30);
  };

  /* ---------- product card ---------- */
  ui.productCard = function (p, opts) {
    opts = opts || {};
    var esc = WT.esc, money = WT.money;
    var d = WT.data;
    var pct = d.discountPct(p);
    var inW = WT.store.inWishlist(p.id);
    var soldOut = d.totalStock(p) === 0;
    var lowStock = !soldOut && d.totalStock(p) <= 8;
    var front = ui.img(p.images && p.images[0]);
    var back = ui.img(p.images && p.images[1] || p.images && p.images[0]);
    var swatches = (p.colors || []).slice(0, 4).map(function (c) {
      return '<span class="swatch-dot" style="--sw:' + esc(c.hex) + '" title="' + esc(c.name) + '"></span>';
    }).join("");
    var tags = (p.tags || []).map(function (t) {
      return '<span class="tag tag--' + esc(t) + '">' + (t === "new" ? "NEW" : t === "bestseller" ? "BEST" : esc(t.toUpperCase())) + "</span>";
    }).join("");

    return '' +
    '<article class="product-card reveal" data-id="' + esc(p.id) + '" data-cat="' + esc(p.category) + '">' +
      '<a class="product-card__media" href="#/product/' + esc(p.id) + '" aria-label="' + esc(p.name) + ' — view product">' +
        '<img class="img-front" src="' + esc(front) + '" alt="' + esc(p.name) + ' — front view, colour ' + esc(p.colors[0].name) + '" width="450" height="562" loading="' + (opts.eager ? "eager" : "lazy") + '" decoding="async">' +
        '<img class="img-back" src="' + esc(back) + '" alt="" width="450" height="562" loading="lazy" decoding="async" aria-hidden="true">' +
        (tags ? '<span class="product-card__tags">' + tags + "</span>" : "") +
        (soldOut ? '<span class="product-card__oos">SOLD OUT</span>' : "") +
      '</a>' +
      '<button class="wish-btn' + (inW ? " is-on" : "") + '" type="button" data-wish="' + esc(p.id) + '" aria-pressed="' + inW + '" aria-label="' + (inW ? "Remove " + esc(p.name) + " from wishlist" : "Add " + esc(p.name) + " to wishlist") + '">' +
        (inW ? ICONS.heartFill : ICONS.heart) +
      '</button>' +
      '<div class="product-card__info">' +
        '<a class="product-card__name" href="#/product/' + esc(p.id) + '">' + esc(p.name) + '</a>' +
        '<span class="product-card__color">' + esc(p.colors[0].name) + '</span>' +
        '<span class="product-card__price">' +
          '<strong>' + money(p.price) + '</strong>' +
          (pct > 0 ? '<s>' + money(p.mrp) + "</s><em>" + pct + "% OFF</em>" : "") +
        '</span>' +
        '<span class="product-card__swatches">' + swatches + "</span>" +
        '<span class="product-card__sizes" role="group" aria-label="Choose size for ' + esc(p.name) + '">' +
          (p.sizes || []).map(function (s) {
            var st = (p.stock && p.stock[s]) || 0;
            var dis = st <= 0;
            return '<button type="button" class="size-chip' + (dis ? " is-off" : "") + '" data-size-pick="' + esc(s) + '" data-pid="' + esc(p.id) + '"' + (dis ? ' disabled aria-disabled="true" title="Sold out"' : "") + ">" + esc(s) + "</button>";
          }).join("") +
        "</span>" +
        '<button type="button" class="btn btn--dark product-card__add" data-add-cart="' + esc(p.id) + '"' + (soldOut ? " disabled" : "") + ">" +
          (soldOut ? "Sold Out" : 'Add to Cart <span class="btn__hint">— select a size</span>') +
        "</button>" +
        (lowStock && !soldOut ? '<span class="product-card__stock">Only ' + d.totalStock(p) + " left</span>" : "") +
      "</div>" +
    "</article>";
  };

  /* size picking inside a card (delegated) */
  function bindSizePick(scope) {
    // state kept on the card element
  }

  /* ---------- category tiles ---------- */
  ui.renderCategories = function () {
    var host = $("#cat-grid");
    if (!host) return;
    host.innerHTML = WT.CATEGORIES.map(function (c, i) {
      var count = WT.data.countFor(c.slug);
      var img = ui.catImg(c.slug);
      return '' +
      '<a class="cat-card reveal" href="#/category/' + c.slug + '" style="--i:' + i + '">' +
        '<img src="' + WT.esc(img) + '" alt="Model wearing WILDTHREAD ' + WT.esc(c.label.toLowerCase()) + ' — shop the ' + WT.esc(c.label) + ' category" width="450" height="562" loading="lazy" decoding="async">' +
        '<span class="cat-card__label">' +
          '<strong>' + WT.esc(c.label) + "</strong>" +
          '<span>' + count + " styles " + ICONS.arrowR + "</span>" +
        "</span>" +
      "</a>";
    }).join("");
  };

  /* ---------- home grid + tabs ---------- */
  ui.renderHomeGrid = function (tab) {
    var host = $("#home-grid");
    if (!host) return;
    var list = tab === "bestseller" ? WT.data.tagged("bestseller") : WT.data.tagged("new");
    host.innerHTML = list.slice(0, 8).map(function (p, i) { return ui.productCard(p, { eager: i < 4 }); }).join("");
    ui.observeReveals(host);
    $$('[data-tab]').forEach(function (b) {
      var on = b.getAttribute("data-tab") === tab;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  };

  /* ---------- countdown ---------- */
  var cdTimer = null;
  ui.startCountdown = function () {
    var host = $("#countdown");
    if (!host) return;
    var target = new Date(WT.config.drop.date).getTime();
    function tick() {
      var diff = Math.max(0, target - Date.now());
      var d = Math.floor(diff / 86400000);
      var h = Math.floor(diff / 3600000) % 24;
      var m = Math.floor(diff / 60000) % 60;
      var s = Math.floor(diff / 1000) % 60;
      function pad(n) { return String(n).padStart(2, "0"); }
      var map = { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
      $$("b[data-cd]", host).forEach(function (b) {
        var k = b.getAttribute("data-cd");
        if (b.textContent !== map[k]) b.textContent = map[k];
      });
      if (diff <= 0 && cdTimer) { clearInterval(cdTimer); cdTimer = null; }
    }
    tick();
    if (cdTimer) clearInterval(cdTimer);
    cdTimer = setInterval(tick, 1000);
  };

  /* notify me (drop) */
  function bindNotify() {
    var btn = $("#notify-btn");
    if (!btn) return;
    var KEY = "wt_notify_drop4";
    function paint(on) {
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.innerHTML = on ? ICONS.check + " You're on the list" : "Notify me";
    }
    paint(!!localStorage.getItem(KEY));
    btn.addEventListener("click", function () {
      var on = !localStorage.getItem(KEY);
      if (on) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY);
      paint(on);
      ui.toast(on ? "We'll ping you when NIGHT RIDER drops." : "Removed from drop alerts.");
    });
  }

  /* ---------- reviews (Swiper) ---------- */
  var REVIEWS = [
    { name: "Aarav M.", city: "Mumbai", text: "The oversized tee is HEAVY. 240 GSM is no joke — fits exactly like the size chart. Wore it three days straight.", rating: 5 },
    { name: "Sana K.", city: "Delhi", text: "Ordered Friday night, wearing it Monday. The acid-yellow packaging alone deserves five stars.", rating: 5 },
    { name: "Rohan T.", city: "Bengaluru", text: "Finally a brand that gets what 'oversized' means. Drop shoulders, boxy body — not just a size up.", rating: 5 },
    { name: "Ishita P.", city: "Pune", text: "My third drop. The hoodie survived 10+ washes, zero fading on the print. Quality is stupid good for the price.", rating: 4 },
    { name: "Dev P.", city: "Ahmedabad", text: "Exchange was painless — wrong size, sorted in two days. The cargos fit like they were tailored.", rating: 5 },
    { name: "Meera J.", city: "Jaipur", text: "Wore the Night Runner tee to a gig and got stopped twice asking where it's from. It's the stitching for me.", rating: 5 }
  ];

  ui.renderReviews = function () {
    var wrap = $("#reviews-wrapper");
    if (!wrap) return;
    wrap.innerHTML = REVIEWS.map(function (r) {
      var stars = "";
      for (var i = 0; i < 5; i++) stars += '<span class="' + (i < r.rating ? "star on" : "star") + '">' + ICONS.star + "</span>";
      return '' +
      '<div class="swiper-slide">' +
        '<figure class="review-card">' +
          '<div class="review-card__stars" aria-label="' + r.rating + ' out of 5 stars">' + stars + "</div>" +
          "<blockquote>" + WT.esc(r.text) + "</blockquote>" +
          "<figcaption><strong>" + WT.esc(r.name) + "</strong><span>" + WT.esc(r.city) + "</span></figcaption>" +
        "</figure>" +
      "</div>";
    }).join("");

    if (window.Swiper) {
      try {
        new window.Swiper("#reviews-swiper", {
          slidesPerView: 1,
          spaceBetween: 20,
          loop: true,
          autoplay: { delay: 4200, pauseOnMouseEnter: true },
          pagination: { el: "#reviews-swiper .swiper-pagination", clickable: true },
          keyboard: { enabled: true },
          a11y: { enabled: true },
          breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }
        });
      } catch (e) { /* graceful: static cards remain */ }
    } else {
      var el = $("#reviews-swiper");
      if (el) el.classList.add("swiper-fallback");
    }
  };

  /* ---------- badges ---------- */
  ui.updateBadges = function () {
    var c = WT.store.cartCount();
    var w = WT.store.wishlist().length;
    var cc = $("#cart-count"), wc = $("#wishlist-count");
    if (cc) {
      cc.textContent = c;
      cc.hidden = c === 0;
      cc.classList.remove("bump");
      void cc.offsetWidth;
      cc.classList.add("bump");
    }
    if (wc) { wc.textContent = w; wc.hidden = w === 0; }
    var hc = $("#cart-head-count");
    if (hc) hc.textContent = c + (c === 1 ? " item" : " items");
  };

  /* ---------- cart drawer ---------- */
  var lastFocus = null;

  ui.openCart = function () {
    var drawer = $("#cart-drawer"), ov = $("#drawer-overlay");
    if (!drawer) return;
    lastFocus = document.activeElement;
    ui.renderCart();
    drawer.hidden = false;
    if (ov) ov.hidden = false;
    requestAnimationFrame(function () {
      drawer.classList.add("is-open");
      document.body.classList.add("no-scroll");
      var f = $("#cart-close", drawer);
      if (f) f.focus();
    });
    ui.announce("Cart opened. " + WT.store.cartCount() + " items.");
  };

  ui.closeCart = function () {
    var drawer = $("#cart-drawer"), ov = $("#drawer-overlay");
    if (!drawer) return;
    drawer.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    setTimeout(function () {
      drawer.hidden = true;
      if (ov) ov.hidden = true;
    }, 350);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  ui.renderCart = function () {
    var itemsEl = $("#cart-items"), foot = $("#cart-foot"), prog = $("#ship-progress");
    if (!itemsEl) return;
    var cart = WT.store.cart();
    var cfg = WT.config;

    if (!cart.length) {
      itemsEl.innerHTML = '' +
        '<div class="cart-empty">' +
          '<p class="cart-empty__big">Your cart is empty.</p>' +
          "<p>Loud looks don't add themselves.</p>" +
          '<a class="btn btn--acid" href="#/category/t-shirts" data-close-cart>Start Shopping</a>' +
        "</div>";
      if (foot) foot.innerHTML = "";
      if (prog) prog.innerHTML = "";
      return;
    }

    itemsEl.innerHTML = cart.map(function (line) {
      var p = WT.data.byId(line.id);
      if (!p) return "";
      var st = (p.stock && p.stock[line.size]) || 0;
      return '' +
      '<div class="cart-item" data-line="' + WT.esc(line.id) + "|" + WT.esc(line.size) + '">' +
        '<a class="cart-item__img" href="#/product/' + WT.esc(p.id) + '" data-close-cart>' +
          '<img src="' + WT.esc(ui.img(p.images[0])) + '" alt="' + WT.esc(p.name) + '" width="72" height="90" loading="lazy">' +
        "</a>" +
        '<div class="cart-item__meta">' +
          '<a class="cart-item__name" href="#/product/' + WT.esc(p.id) + '" data-close-cart>' + WT.esc(p.name) + "</a>" +
          '<span class="cart-item__sub">Size ' + WT.esc(line.size) + " · " + WT.esc(p.colors[0].name) + "</span>" +
          '<span class="cart-item__price">' + WT.money(p.price) + "</span>" +
          '<div class="cart-item__row">' +
            '<span class="qty-step">' +
              '<button type="button" data-qty="-1" data-pid="' + WT.esc(line.id) + '" data-size="' + WT.esc(line.size) + '" aria-label="Decrease quantity">' + ICONS.minus + "</button>" +
              '<b aria-live="polite">' + line.qty + "</b>" +
              '<button type="button" data-qty="1" data-pid="' + WT.esc(line.id) + '" data-size="' + WT.esc(line.size) + '" aria-label="Increase quantity"' + (line.qty >= st ? ' disabled title="Max stock reached"' : "") + ">" + ICONS.plus + "</button>" +
            "</span>" +
            '<button type="button" class="cart-item__rm" data-remove="' + WT.esc(line.id) + "|" + WT.esc(line.size) + '" aria-label="Remove ' + WT.esc(p.name) + " from cart\">" + ICONS.trash + "</button>" +
          "</div>" +
        "</div>" +
      "</div>";
    }).join("");

    var t = WT.store.totals(ui._coupon);
    if (prog) {
      var left = Math.max(0, cfg.freeShippingAbove - t.subtotal);
      var pct = Math.min(100, Math.round((t.subtotal / cfg.freeShippingAbove) * 100));
      prog.innerHTML = left > 0
        ? '<p>Add <strong>' + WT.money(left) + "</strong> more for <strong>FREE shipping</strong></p>" +
          '<span class="ship-bar"><i style="width:' + pct + '%"></i></span>'
        : '<p class="ship-done">' + ICONS.check + " You've unlocked FREE shipping</p>" +
          '<span class="ship-bar"><i style="width:100%"></i></span>';
    }
    if (foot) {
      foot.innerHTML = '' +
        '<form class="coupon-row" id="coupon-form" novalidate>' +
          '<label class="sr-only" for="coupon-input">Coupon code</label>' +
          '<input id="coupon-input" type="text" inputmode="text" autocomplete="off" placeholder="Coupon code (try WILD10)" value="' + WT.esc(ui._coupon || "") + '">' +
          '<button class="btn btn--ghost btn--sm" type="submit">Apply</button>' +
        "</form>" +
        (ui._couponMsg ? '<p class="coupon-msg">' + WT.esc(ui._couponMsg) + "</p>" : "") +
        '<dl class="totals">' +
          "<div><dt>Subtotal</dt><dd>" + WT.money(t.subtotal) + "</dd></div>" +
          (t.discount > 0 ? '<div class="totals__off"><dt>Coupon ' + WT.esc(cfg.coupon.code) + "</dt><dd>−" + WT.money(t.discount) + "</dd></div>" : "") +
          "<div><dt>Shipping</dt><dd>" + (t.shipping === 0 ? "FREE" : WT.money(t.shipping)) + "</dd></div>" +
          '<div class="totals__grand"><dt>Total</dt><dd>' + WT.money(t.total) + "</dd></div>" +
        "</dl>" +
        '<a class="btn btn--acid btn--block" href="#/checkout" data-close-cart>Checkout ' + ICONS.arrowR + "</a>" +
        '<button class="btn btn--ghost btn--block" type="button" data-close-cart>Continue shopping</button>';
    }
  };

  ui._coupon = null;
  ui._couponMsg = "";

  /* ---------- focus trap ---------- */
  function trapFocus(container, e) {
    var focusables = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', container)
      .filter(function (el) { return el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  ui.trapFocus = trapFocus;

  /* ---------- mobile menu ---------- */
  ui.openMenu = function () {
    var m = $("#mobile-menu");
    if (!m) return;
    lastFocus = document.activeElement;
    m.hidden = false;
    requestAnimationFrame(function () {
      m.classList.add("is-open");
      document.body.classList.add("no-scroll");
      var b = $("#nav-burger");
      if (b) b.setAttribute("aria-expanded", "true");
      var f = $("a, button", m); if (f) f.focus();
    });
  };
  ui.closeMenu = function () {
    var m = $("#mobile-menu");
    if (!m) return;
    m.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    var b = $("#nav-burger");
    if (b) b.setAttribute("aria-expanded", "false");
    setTimeout(function () { m.hidden = true; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  /* ---------- search dropdown ---------- */
  var searchState = { items: [], active: -1, open: false, timer: null };

  ui.closeSearch = function () {
    var dd = $("#search-dropdown"), input = $("#search-input");
    if (dd) { dd.hidden = true; dd.innerHTML = ""; }
    if (input) { input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); }
    searchState.open = false; searchState.active = -1; searchState.items = [];
  };

  function renderSearchDropdown(q) {
    var dd = $("#search-dropdown"), input = $("#search-input");
    if (!dd || !input) return;
    q = (q || "").trim();
    if (q.length < 2) { ui.closeSearch(); return; }
    var parsed = WT.search.parseQuery(q);
    var matches = WT.search.matchProducts(WT.data.all(), parsed).slice(0, 5);
    searchState.items = matches;
    searchState.active = -1;

    var html = "";
    if (matches.length) {
      html = '<ul class="search-drop__list" role="listbox" id="search-listbox">' +
        matches.map(function (p, i) {
          return '<li role="option" id="srch-opt-' + i + '" aria-selected="false">' +
            '<a class="search-drop__item" href="#/product/' + WT.esc(p.id) + '" data-search-idx="' + i + '">' +
              '<img src="' + WT.esc(ui.img(p.images[0])) + '" alt="" width="44" height="55" loading="lazy">' +
              '<span><strong>' + WT.esc(p.name) + "</strong><em>" + WT.esc(WT.data.categoryLabel(p.category)) + " · " + WT.money(p.price) + "</em></span>" +
            "</a></li>";
        }).join("") + "</ul>";
      if ((parsed.color || parsed.type) && matches.length) {
        html += '<p class="search-drop__hint">' +
          (parsed.color ? 'Colour: <b>' + WT.esc(parsed.colorPhrase) + "</b>" : "") +
          (parsed.color && parsed.type ? " · " : "") +
          (parsed.type ? 'Type: <b>' + WT.esc(parsed.typePhrase) + "</b>" : "") + "</p>";
      }
      html += '<a class="search-drop__all" href="#/search?q=' + encodeURIComponent(q) + '">See all results for &ldquo;' + WT.esc(q) + "&rdquo; " + ICONS.arrowR + "</a>";
    } else {
      html = '<div class="search-drop__none">' +
        "<p>No matches for &ldquo;" + WT.esc(q) + "&rdquo; right now.</p>" +
        '<a class="search-drop__all" href="#/search?q=' + encodeURIComponent(q) + '">Browse suggestions ' + ICONS.arrowR + "</a>" +
        "</div>";
    }
    dd.innerHTML = html;
    dd.hidden = false;
    input.setAttribute("aria-expanded", "true");
    searchState.open = true;
    ui.announce(matches.length ? matches.length + " quick results" : "No quick results");
  }

  function moveSearchActive(dir) {
    if (!searchState.open || !searchState.items.length) return;
    var input = $("#search-input");
    searchState.active += dir;
    if (searchState.active < 0) searchState.active = searchState.items.length - 1;
    if (searchState.active >= searchState.items.length) searchState.active = 0;
    $$("#search-dropdown .search-drop__item").forEach(function (a, i) {
      var on = i === searchState.active;
      a.classList.toggle("is-active", on);
      a.setAttribute("aria-selected", on ? "true" : "false");
      if (on) {
        a.scrollIntoView({ block: "nearest" });
        if (input) input.setAttribute("aria-activedescendant", "srch-opt-" + i);
      }
    });
  }

  function bindSearch() {
    var input = $("#search-input");
    if (!input) return;
    input.addEventListener("input", function () {
      clearTimeout(searchState.timer);
      var v = input.value;
      searchState.timer = setTimeout(function () { renderSearchDropdown(v); }, 200);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); moveSearchActive(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); moveSearchActive(-1); }
      else if (e.key === "Enter") {
        if (searchState.active >= 0 && searchState.items[searchState.active]) {
          e.preventDefault();
          var p = searchState.items[searchState.active];
          ui.closeSearch();
          location.hash = "#/product/" + p.id;
        } else if (input.value.trim().length >= 2) {
          e.preventDefault();
          var q = input.value.trim();
          ui.closeSearch();
          location.hash = "#/search?q=" + encodeURIComponent(q);
        }
      } else if (e.key === "Escape") {
        if (searchState.open) { e.stopPropagation(); ui.closeSearch(); }
      }
    });
    input.addEventListener("focus", function () {
      if (input.value.trim().length >= 2) renderSearchDropdown(input.value);
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav__search")) ui.closeSearch();
    });
  }

  /* ---------- newsletter ---------- */
  function bindNewsletter() {
    var form = $("#newsletter-form");
    if (!form) return;
    var email = $("#newsletter-email"), msg = $("#newsletter-msg");
    function setMsg(text, ok) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = "form-msg " + (ok ? "is-ok" : "is-err");
      if (email) email.setAttribute("aria-invalid", ok ? "false" : "true");
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = (email.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        setMsg("That email doesn't look right — try again?", false);
        email.focus();
        return;
      }
      var list = WT.store.read(WT.store.KEYS.news, []);
      if (list.indexOf(v.toLowerCase()) !== -1) {
        setMsg("You're already in the gang. Check your inbox for the code.", true);
        return;
      }
      list.push(v.toLowerCase());
      WT.store.write(WT.store.KEYS.news, list);
      setMsg("You're in! Code WILD10 hits your inbox soon.", true);
      ui.toast("Welcome to the gang — 10% off unlocked.");
      form.reset();
    });
  }

    /* ---------- custom cursor (desktop, fine pointer) ---------- */
  function initCursor() {
    var cur = $("#cursor");
    if (!cur) return;
    var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) { cur.remove(); return; }
    var x = -100, y = -100, tx = x, ty = y, raf, shown = false;
    document.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) {                       /* only hide the system cursor once ours is actually visible */
        shown = true; x = tx; y = ty;
        document.body.classList.add("has-cursor");
        cur.classList.add("is-on");
      }
      if (!raf) loop();
    }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.classList.remove("is-on"); });
    document.addEventListener("mouseenter", function () { if (shown) cur.classList.add("is-on"); });
    function loop() {
      x += (tx - x) * 0.35; y += (ty - y) * 0.35;
      cur.style.transform = "translate(" + x + "px," + y + "px)";
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    document.addEventListener("mouseover", function (e) {
      var hot = e.target.closest("a, button, [data-cursor], input, select, textarea, label, summary, [role='button'], .product-card, .cat-card, .swiper");
      cur.classList.toggle("is-hot", !!hot);
      var label = hot && hot.getAttribute && hot.getAttribute("data-cursor");
      cur.classList.toggle("is-label", !!label);
      cur.textContent = label || "";
    }, { passive: true });
  }
  /* ---------- magnetic buttons ---------- */
  function initMagnets() {
    if (!(window.matchMedia && window.matchMedia("(pointer: fine)").matches)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    $$("[data-magnet]").forEach(function (el) {
      var strength = 18;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + (dx / r.width) * strength + "px," + (dy / r.height) * strength + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transition = "transform .45s cubic-bezier(.34,1.56,.64,1)";
        el.style.transform = "";
        setTimeout(function () { el.style.transition = ""; }, 460);
      });
    });
  }

  /* ---------- tilt cards ---------- */
  function initTilt() {
    if (!(window.matchMedia && window.matchMedia("(pointer: fine)").matches)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        el.style.transform = "perspective(700px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- scroll reveals ---------- */
  var revealIO = null;
  ui.observeReveals = function (root) {
    var els = $$(".reveal:not(.is-in)", root || document);
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            revealIO.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    }
    els.forEach(function (el, i) {
      if (!el.style.getPropertyValue("--i")) el.style.setProperty("--i", i % 6);
      revealIO.observe(el);
    });
  };

  /* ---------- nav scroll / back-to-top ---------- */
  function initScrollFx() {
    var nav = $("#nav"), toTop = $("#to-top");
    var lastY = 0, ticking = false;
    function onScroll() {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("is-scrolled", y > 24);
      if (toTop) toTop.classList.toggle("is-show", y > 700);
      lastY = y; ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- wishlist re-render hook ---------- */
  ui.refreshWishButtons = function () {
    $$("[data-wish]").forEach(function (b) {
      var on = WT.store.inWishlist(b.getAttribute("data-wish"));
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.innerHTML = on ? ICONS.heartFill : ICONS.heart;
    });
  };

  /* ---------- global delegation ---------- */
  function bindGlobal() {
    document.addEventListener("click", function (e) {
      var t = e.target;

      /* burger */
      if (t.closest("#nav-burger")) {
        var m = $("#mobile-menu");
        if (m && m.hidden) ui.openMenu(); else ui.closeMenu();
        return;
      }
      if (t.closest("[data-close-menu]") || (t.closest("#mobile-menu") && t.closest("a"))) {
        ui.closeMenu();
      }

      /* cart open/close */
      if (t.closest("#cart-open")) { e.preventDefault(); ui.openCart(); return; }
      if (t.closest("#cart-close") || t.closest("#drawer-overlay") || t.closest("[data-close-cart]")) {
        ui.closeCart();
      }

      /* wishlist toggle */
      var wb = t.closest("[data-wish]");
      if (wb) {
        var id = wb.getAttribute("data-wish");
        var p = WT.data.byId(id);
        var added = WT.store.toggleWishlist(id);
        ui.refreshWishButtons();
        ui.toast(added ? (p ? p.name : "Item") + " saved to wishlist." : (p ? p.name : "Item") + " removed from wishlist.");
        ui.announce(added ? "Added to wishlist" : "Removed from wishlist");
        return;
      }

      /* size pick on cards */
      var sp = t.closest("[data-size-pick]");
      if (sp && !sp.disabled) {
        var card = sp.closest(".product-card, .pd, .wish-card");
        if (card) {
          $$("[data-size-pick]", card).forEach(function (b) { b.classList.remove("is-on"); });
          sp.classList.add("is-on");
          card.dataset.selSize = sp.getAttribute("data-size-pick");
          var add = $("[data-add-cart]", card);
          if (add && !add.disabled) add.innerHTML = "Add to Cart — " + WT.esc(card.dataset.selSize);
        }
        return;
      }

      /* add to cart */
      var ab = t.closest("[data-add-cart]");
      if (ab && !ab.disabled) {
        var pid = ab.getAttribute("data-add-cart");
        var scope = ab.closest(".product-card, .pd, .wish-card") || document;
        var size = scope.dataset.selSize || (scope !== document ? "" : "");
        if (!size && ab.dataset.size) size = ab.dataset.size;
        var prod = WT.data.byId(pid);
        if (!size) {
          if (prod && prod.sizes.length === 1) size = prod.sizes[0];
          else {
            ui.toast("Select a size first.", "warn");
            ui.announce("Select a size before adding to cart");
            var chips = $$("[data-size-pick]:not([disabled])", scope);
            if (chips[0]) chips[0].focus();
            return;
          }
        }
        var qty = 1;
        var qEl = $("[data-qty-val]", scope);
        if (qEl) qty = parseInt(qEl.textContent, 10) || 1;
        var res = WT.store.addToCart(pid, size, qty);
        if (res.ok) {
          ui.updateBadges();
          ui.toast((prod ? prod.name : "Item") + " · " + size + " added to cart.");
          ui.announce("Added to cart. " + WT.store.cartCount() + " items total.");
          var drawer = $("#cart-drawer");
          if (drawer && !drawer.hidden) ui.renderCart();
          if (ab.classList.contains("product-card__add")) {
            ab.innerHTML = ICONS.check + " Added";
            setTimeout(function () { ab.innerHTML = 'Add to Cart <span class="btn__hint">— select a size</span>'; delete scope.dataset.selSize; $$("[data-size-pick]", scope).forEach(function (b) { b.classList.remove("is-on"); }); }, 1200);
          }
        } else if (res.reason === "oos") ui.toast("That size just sold out.", "warn");
        else if (res.reason === "max") ui.toast("Only " + res.max + " in stock for that size.", "warn");
        else ui.toast("Select a size first.", "warn");
        return;
      }

      /* qty steppers (cart drawer) */
      var qb = t.closest("[data-qty]");
      if (qb && !qb.disabled) {
        var qpid = qb.getAttribute("data-pid"), qs = qb.getAttribute("data-size");
        var delta = parseInt(qb.getAttribute("data-qty"), 10);
        var line = WT.store.cart().filter(function (l) { return l.id === qpid && l.size === qs; })[0];
        if (line) {
          WT.store.setQty(qpid, qs, line.qty + delta);
          ui.updateBadges(); ui.renderCart();
        }
        return;
      }

      /* remove line */
      var rm = t.closest("[data-remove]");
      if (rm) {
        var parts = rm.getAttribute("data-remove").split("|");
        WT.store.removeLine(parts[0], parts[1]);
        ui.updateBadges(); ui.renderCart();
        ui.toast("Removed from cart.");
        return;
      }

      /* back-to-top handled in initScrollFx */
    });

    /* coupon submit (delegated — foot re-renders) */
    document.addEventListener("submit", function (e) {
      if (e.target && e.target.id === "coupon-form") {
        e.preventDefault();
        var inp = $("#coupon-input");
        var code = (inp && inp.value || "").trim().toUpperCase();
        if (!code) { ui._coupon = null; ui._couponMsg = ""; }
        else if (code === WT.config.coupon.code) {
          ui._coupon = code;
          ui._couponMsg = "Code applied — " + WT.config.coupon.pct + "% off your subtotal.";
          ui.toast("Coupon " + code + " applied.");
        } else {
          ui._coupon = null;
          ui._couponMsg = "That code isn't valid. Hint: WILD10.";
        }
        ui.renderCart();
        return;
      }
    });

    /* Esc key — close drawer / menu / search */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var drawer = $("#cart-drawer");
        if (drawer && !drawer.hidden) { ui.closeCart(); return; }
        var m = $("#mobile-menu");
        if (m && !m.hidden) { ui.closeMenu(); return; }
        ui.closeSearch();
      }
    });

    /* focus traps */
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var drawer = $("#cart-drawer");
      if (drawer && !drawer.hidden) { trapFocus(drawer, e); return; }
      var m = $("#mobile-menu");
      if (m && !m.hidden) trapFocus(m, e);
    });

    /* tabs */
    document.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-tab]");
      if (tab) ui.renderHomeGrid(tab.getAttribute("data-tab"));
    });

    /* cross-tab + store sync */
    WT.store.onChange(function () {
      ui.updateBadges();
      var drawer = $("#cart-drawer");
      if (drawer && !drawer.hidden) ui.renderCart();
      ui.refreshWishButtons();
    });
  }

  /* ---------- boot ---------- */
  ui.init = function () {
    armImageFallback();
    ui.renderCategories();
    ui.renderHomeGrid("new");
    ui.renderReviews();
    ui.startCountdown();
    bindNotify();
    bindSearch();
    bindNewsletter();
    initCursor();
    initMagnets();
    initTilt();
    initScrollFx();
    bindGlobal();
    ui.updateBadges();
    ui.observeReveals(document);
  };
})();
