// Navbar component + Wishlist API + category & search routing
(function () {
  const CSS_PATH = "CSS/navbar.css";
  const NAV_PLACEHOLDER_IDS = ["navbar-container", "navbar-placeholder", "navbar"];
  // canonical key for wishlist (the app will now read/write 'wishlist')
  const CANONICAL_WKEY = "wishlist";
  // keep old key as legacy to read/merge if still present
  const LEGACY_WKEY = "wearopia_wishlist";
  const CART_KEYS = ["wearopia_cart", "cart", "cartItems"];

  function ensureCss() {
    if (!document.querySelector(`link[href="${CSS_PATH}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_PATH;
      document.head.appendChild(link);
    }
  }

  // Note: data-category attributes are used so clicks route to product-catalog.html?category=...
  const NAV_HTML = `
  <div class="navbar-wrapper">
    <nav class="navbar">
      <a href="index.html" class="navbar-brand">Wearopia</a>

      <ul class="navbar-menu" id="navbarMenu">
        <li><a href="product-catalog.html" data-category="Men">Man</a></li>
        <li><a href="product-catalog.html" data-category="Women">Women</a></li>
        <li><a href="product-catalog.html" data-category="Kids">Kids</a></li>
        <li><a href="product-catalog.html" data-category="Accessories">Accessory</a></li>
      </ul>

      <div class="search-container">
        <i class="bi bi-search search-icon"></i>
        <input type="text" class="search-box" placeholder="Search for outfits...">
      </div>

      <div class="navbar-actions">
        <div class="dropdown" id="userDropdownWrapper">
          <a href="#" id="loginBtn">
            <i class="bi bi-box-arrow-in-right"></i>
            <span>Login</span>
          </a>
          <div class="dropdown-menu" id="userMenu">
            <a href="mainProfile.html" class="dropdown-item"><i class="bi bi-person"></i> Profile</a>
            <a href="#" class="dropdown-item"><i class="bi bi-bag"></i> Orders</a>
            <a href="WHISLIST.HTML" class="dropdown-item"><i class="bi bi-heart"></i> Wishlist</a>
            <hr>
            <a href="#" class="dropdown-item text-danger" id="logoutBtn">
              <i class="bi bi-box-arrow-right"></i> Logout
            </a>
          </div>
        </div>

        <a href="WHISLIST.HTML" id="wishlistBtn" class="nav-action">
          <i class="bi bi-heart"></i>
          <span>Wishlist</span>
          <span class="badge-count" id="wishlistCount">0</span>
        </a>

        <a href="shopping-cart.html" id="cartBtn" class="nav-action">
          <i class="bi bi-bag"></i>
          <span>Cart</span>
          <span class="badge-count" id="cartCount">0</span>
        </a>
      </div>

      <button class="menu-toggle" id="menuToggle">
        <i class="bi bi-list"></i>
      </button>
    </nav>

    <div class="mobile-dropdown" id="mobileMenu">
      <div class="mobile-search">
        <i class="bi bi-search search-icon"></i>
        <input type="text" class="search-box" placeholder="Search for outfits...">
      </div>
      <ul>
        <li><a href="product-catalog.html" data-category="Men">Man</a></li>
        <li><a href="product-catalog.html" data-category="Women">Women</a></li>
        <li><a href="product-catalog.html" data-category="Kids">Kids</a></li>
        <li><a href="product-catalog.html" data-category="Accessories">Accessory</a></li>
      </ul>
    </div>
  </div>
  `;

  // --- storage helpers (safe) ---
  function safeParse(raw, fallback = null) {
    try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
  }

  function getCanonicalWishlist() {
    const raw = localStorage.getItem(CANONICAL_WKEY);
    const parsed = safeParse(raw, null);
    if (Array.isArray(parsed)) return parsed.map(Number).filter(n => !Number.isNaN(n));
    if (parsed && typeof parsed === "object") return Object.keys(parsed).map(k => Number(k)).filter(n => !Number.isNaN(n));
    const legacy = safeParse(localStorage.getItem(LEGACY_WKEY), null);
    if (legacy) {
      if (Array.isArray(legacy)) return legacy.map(Number).filter(n => !Number.isNaN(n));
      if (typeof legacy === "object") return Object.keys(legacy).map(k => Number(k)).filter(n => !Number.isNaN(n));
    }
    return [];
  }

  function writeCanonicalWishlist(arr) {
    const uniq = Array.from(new Set(arr.map(Number).filter(n => !Number.isNaN(n))));
    localStorage.setItem(CANONICAL_WKEY, JSON.stringify(uniq));
    writeLegacyFromCanonical(uniq);
    if (window.NavbarComponent && typeof window.NavbarComponent.updateCounts === "function") window.NavbarComponent.updateCounts();
  }

  function writeLegacyFromCanonical(arr) {
    const obj = {};
    arr.forEach(id => { if (!Number.isNaN(Number(id))) obj[String(Number(id))] = true; });
    try { localStorage.setItem(LEGACY_WKEY, JSON.stringify(obj)); } catch {}
  }

  function getCartCount() {
    for (const key of CART_KEYS) {
      const raw = localStorage.getItem(key);
      const parsed = safeParse(raw, null);
      if (!parsed) continue;
      if (Array.isArray(parsed)) return parsed.length;
      if (typeof parsed === "object") return Object.keys(parsed).length;
    }
    return 0;
  }

  function updateWishlistBadgeFallback() {
    const badge = document.getElementById("wishlistCount");
    const wl = getCanonicalWishlist();
    if (badge) badge.textContent = wl.length ? String(wl.length) : "0";
  }

  function updateNavbarCounts() {
    // Debug: print current localStorage shapes we care about
    try {
      const rawCanon = localStorage.getItem(CANONICAL_WKEY);
      const rawLegacy = localStorage.getItem(LEGACY_WKEY);
      const rawWearCart = localStorage.getItem('wearopia_cart');
      console.debug('[NavbarCounts] raw wearopia_wishlist:', rawCanon);
      console.debug('[NavbarCounts] raw wishlist (legacy):', rawLegacy);
      console.debug('[NavbarCounts] raw wearopia_cart:', rawWearCart);
    } catch (e) {
      console.warn('[NavbarCounts] read error', e);
    }

    const wEl = document.getElementById("wishlistCount");
    const cEl = document.getElementById("cartCount");

    // compute counts using existing helpers
    let wlArr = [];
    try { wlArr = getCanonicalWishlist(); } catch(e){ console.warn('[NavbarCounts] getCanonicalWishlist error', e); }

    const cartCountComputed = (()=>{
      try {
        // try canonical cart keys
        for (const key of CART_KEYS) {
          const raw = localStorage.getItem(key);
          const parsed = safeParse(raw, null);
          if (!parsed) continue;
          if (Array.isArray(parsed)) return parsed.length;
          if (typeof parsed === "object") {
            // try sum quantities if numeric
            const vals = Object.values(parsed).map(v => Number(v) || 0);
            const qtySum = vals.reduce((s, n) => s + n, 0);
            if (qtySum > 0) return qtySum;
            return Object.keys(parsed).length;
          }
        }
      } catch (e) { console.warn('[NavbarCounts] cart compute error', e); }
      return 0;
    })();

    const wishlistCountComputed = Array.isArray(wlArr) ? wlArr.length : 0;

    console.debug('[NavbarCounts] computed wishlistCount:', wishlistCountComputed, 'computed cartCount:', cartCountComputed);

    if (wEl) {
      wEl.textContent = String(wishlistCountComputed);
      wEl.style.display = ''; // ensure visible
    }
    if (cEl) {
      cEl.textContent = String(cartCountComputed);
      cEl.style.display = '';
    }
  }

  // small helper to route to product-catalog with category/q params
  function routeToCatalog(params = {}) {
    const parts = [];
    if (params.category) parts.push(`category=${encodeURIComponent(params.category)}`);
    if (params.q) parts.push(`q=${encodeURIComponent(params.q)}`);
    const query = parts.length ? `?${parts.join("&")}` : "";
    window.location.href = `product-catalog.html${query}`;
  }

  function readLoggedInUserName() {
    try {
      const obj = JSON.parse(localStorage.getItem("loggedInUser") || "null");
      if (obj && (obj.name || obj.fullname || obj.email)) return obj.name || obj.fullname || obj.email;
    } catch {}
    return localStorage.getItem("userName") || "Account";
  }

  function renderAuthState() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const loginBtn = document.getElementById("loginBtn");
    const userMenu = document.getElementById("userMenu");
    if (!loginBtn) return;
    if (isLoggedIn) {
      loginBtn.innerHTML = '<i class="bi bi-person-circle"></i><span>Account</span>';
      loginBtn.href = "#";
      loginBtn.onclick = function (e) { e.preventDefault(); if (userMenu) userMenu.classList.toggle("show"); };
      const accountName = document.getElementById("accountName"); if (accountName) accountName.textContent = readLoggedInUserName();
    } else {
      loginBtn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i><span>Login</span>';
      loginBtn.href = "login.html";
      if (userMenu) userMenu.classList.remove("show");
    }
  }

  function attachBehavior(root) {
    const menuToggle = root.querySelector("#menuToggle");
    const mobileMenu = root.querySelector("#mobileMenu");
    const userMenu = root.querySelector("#userMenu");
    const logoutBtn = root.querySelector("#logoutBtn");
    const searchBoxes = root.querySelectorAll(".search-box");

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", () => mobileMenu.classList.toggle("show"));
    }

    // Route category links from navbar + mobile menu -> product-catalog?category=...
    root.querySelectorAll(".navbar-menu a[data-category], #mobileMenu a[data-category]").forEach(a => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const cat = a.getAttribute("data-category");
        if (cat) routeToCatalog({ category: cat });
        else window.location.href = a.href;
      });
    });

    // Search boxes: go to product-catalog?q=...
    if (searchBoxes && searchBoxes.length) {
      searchBoxes.forEach((sb) => {
        sb.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const q = sb.value && sb.value.trim();
            if (q) routeToCatalog({ q });
          }
        });
      });
    }

    // Close mobile menu on link click
    const mobileLinks = root.querySelectorAll("#mobileMenu a");
    mobileLinks.forEach((a) => a.addEventListener("click", () => mobileMenu && mobileMenu.classList.remove("show")));

    // wire logout
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.setItem("isLoggedIn", "false");
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("userName");
        renderAuthState();
        updateNavbarCounts();
        if (window.Swal) {
          Swal.fire({ title: "Logged out", text: "You have been signed out.", icon: "success" }).then(() => window.location.href = "index.html");
        } else window.location.href = "index.html";
      });
    }
  }

  function findPlaceholder() {
    for (const id of NAV_PLACEHOLDER_IDS) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  function loadNavbar() {
    ensureCss();
    let placeholder = findPlaceholder();
    if (!placeholder) {
      placeholder = document.createElement("div");
      placeholder.id = "navbar-container";
      document.body.insertBefore(placeholder, document.body.firstChild);
    }
    placeholder.innerHTML = NAV_HTML;
    attachBehavior(placeholder);
    renderAuthState();
    updateNavbarCounts();
  }

  // storage events
  window.addEventListener("storage", function (e) {
    if (!e.key) return;
    if ([CANONICAL_WKEY, LEGACY_WKEY, "cart", "wearopia_cart", "isLoggedIn", "loggedInUser", "userName"].includes(e.key)) {
      updateNavbarCounts();
      if (["isLoggedIn", "loggedInUser", "userName"].includes(e.key)) renderAuthState();
    }
  });

  // Wishlist API
  const WishlistAPI = {
    getAll: function () { return getCanonicalWishlist(); },
    isInWishlist: function (productId) { return getCanonicalWishlist().includes(Number(productId)); },
    add: function (productId) { const id = Number(productId); if (Number.isNaN(id)) return false; const arr = getCanonicalWishlist(); if (!arr.includes(id)) { arr.push(id); writeCanonicalWishlist(arr); return true;} return false; },
    remove: function (productId) { const id = Number(productId); if (Number.isNaN(id)) return false; let arr = getCanonicalWishlist(); if (arr.includes(id)) { arr = arr.filter(x => x !== id); writeCanonicalWishlist(arr); return true; } return false; },
    toggle: function (productId) { if (this.isInWishlist(productId)) return this.remove(productId); return this.add(productId); },
    clear: function () { writeCanonicalWishlist([]); }
  };

  window.WishlistAPI = WishlistAPI;

  window.NavbarComponent = { init: loadNavbar, updateCounts: updateNavbarCounts, renderAuthState };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadNavbar);
  else loadNavbar();

  // quick sync: re-run counts after init to catch writes done after components loads
  setTimeout(() => { try { updateNavbarCounts(); console.debug('[NavbarCounts] delayed update (200ms)'); } catch(e){} }, 200);
  setTimeout(() => { try { updateNavbarCounts(); console.debug('[NavbarCounts] delayed update (1200ms)'); } catch(e){} }, 1200);
  // expose a manual helper to force refresh from console if needed
  window.__updateNavbarBadges = updateNavbarCounts;
})();