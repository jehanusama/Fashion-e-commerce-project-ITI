// Wrapped in an IIFE to avoid polluting global scope and to avoid duplicate-declaration errors.
(function () {
  'use strict';

  /* navbar counters (module-scoped) */
  let wishlistCount = 0;
  let cartCount = 0;

  const wishlistBadge = document.getElementById('wishlistCount');
  const cartBadge = document.getElementById('cartCount');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  // Storage helpers (tolerant)
  const CART_KEY = 'wearopia_cart_v1';
  const WISHLIST_KEY = 'wearopia_wishlist';

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : { items: [] };
    } catch {
      return { items: [] };
    }
  }

  function saveCart(state) {
    localStorage.setItem(CART_KEY, JSON.stringify(state));
  }

  function loadWishlist() {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(Number).filter(n => !Number.isNaN(n));
        if (parsed && typeof parsed === 'object') return Object.keys(parsed).map(k => Number(k)).filter(n => !Number.isNaN(n));
      }
    } catch (e) {}
    // fallback to legacy key
    try {
      const alt = localStorage.getItem('wishlist');
      if (alt) {
        const parsedAlt = JSON.parse(alt);
        if (Array.isArray(parsedAlt)) return parsedAlt.map(Number).filter(n => !Number.isNaN(n));
        if (parsedAlt && typeof parsedAlt === 'object') return Object.keys(parsedAlt).map(k => Number(k)).filter(n => !Number.isNaN(n));
      }
    } catch (e) {}
    return [];
  }

  function saveWishlist(arr) {
    const uniq = Array.from(new Set((Array.isArray(arr) ? arr : []).map(Number).filter(n => !Number.isNaN(n))));
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(uniq));
    // mirror legacy object for old pages
    try {
      const mirror = Object.fromEntries(uniq.map(i => [String(i), true]));
      localStorage.setItem('wishlist', JSON.stringify(mirror));
    } catch (e) {}
  }

  function showToast(title, msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-custom p-3 mb-2 bg-success text-white rounded shadow';
    toast.innerHTML = `
      <strong>${title}</strong><br>
      <small>${msg}</small>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // UI wiring (guarded)
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('show');
      const icon = menuToggle.querySelector('i');
      if (!icon) return;
      if (mobileMenu.classList.contains('show')) {
        icon.classList.remove('bi-list');
        icon.classList.add('bi-x');
      } else {
        icon.classList.remove('bi-x');
        icon.classList.add('bi-list');
      }
    });

    // Close mobile menu on link click (guard)
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        if (window.innerWidth <= 768) {
          mobileMenu.classList.remove('show');
          const icon = menuToggle.querySelector('i');
          if (icon) {
            icon.classList.remove('bi-x');
            icon.classList.add('bi-list');
          }
        }
      });
    });
  }

  // Desktop links active state (guarded)
  const desktopLinks = document.querySelectorAll('.navbar-menu a') || [];
  desktopLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      desktopLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Example product; if you are using selected_product from localStorage, that code can override this
  let product = {
    id: 'prod_jogger_001',
    name: 'Grey Acid Wash Wide Leg Jogger',
    price: 215.00,
    image: 'Images/shoes.png',
    color: 'Black',
    size: 'XS'
  };

  // If a selected_product is stored, prefer that
  try {
    const sp = JSON.parse(localStorage.getItem('selected_product') || 'null');
    if (sp && sp.id) product = sp;
  } catch (e) {}

  // Thumbnail click
  document.querySelectorAll('.thumb').forEach(thumb => {
    thumb.addEventListener('click', function () {
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      if (this.dataset && this.dataset.src) {
        const main = document.getElementById('mainImage');
        if (main) main.src = this.dataset.src;
      }
    });
  });

  // Color buttons (guarded)
  document.querySelectorAll('.color-circle').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.color-circle').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      const color = this.dataset.color;
      const sel = document.getElementById('selectedColor');
      if (sel) sel.textContent = color;
      product.color = color;
    });
  });

  // Size buttons (guarded)
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const sel = document.getElementById('selectedSize');
      if (sel) sel.textContent = this.textContent.trim();
      product.size = this.textContent.trim();
    });
  });

  // Add to cart button
  const addToCartBtn = document.querySelector('.add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const state = loadCart();
      state.items = state.items || [];
      const existing = state.items.find(i =>
        i.id === product.id &&
        i.size === product.size &&
        i.color === product.color
      );
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty: 1,
          size: product.size,
          variant: `Color: ${product.color}`
        });
      }
      saveCart(state);
      showToast('Added to Cart', `${product.name} (${product.size}, ${product.color})`);
      updateNavbarCounts();
    });
  }

  // Wishlist toggle button (guarded)
  (function wireWishlistBtn() {
    // Find a button that contains a heart icon
    const heartIcon = document.querySelector('.btn i.bi-heart, .btn i.bi-heart-fill');
    const addToWishlistBtn = heartIcon ? heartIcon.closest('.btn') : null;
    if (!addToWishlistBtn) return;

    addToWishlistBtn.addEventListener('click', () => {
      const wl = loadWishlist();
      const productId = product.id;
      if (!wl.includes(productId)) {
        wl.push(productId);
        saveWishlist(wl);
        showToast('Added to Wishlist', 'You can view it in your wishlist');
      } else {
        showToast('Already in Wishlist', 'This product is already saved');
      }
      updateNavbarCounts();
    });
  })();

  // Navbar counts sync
  function updateNavbarCounts() {
    // Cart
    const cart = loadCart();
    const totalCartItems = (cart.items || []).reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    if (cartBadge) {
      cartBadge.textContent = String(totalCartItems);
      cartBadge.classList.toggle('show', totalCartItems > 0);
    }

    // Wishlist
    const wishlist = loadWishlist() || [];
    if (wishlistBadge) {
      wishlistBadge.textContent = String(wishlist.length);
      wishlistBadge.classList.toggle('show', wishlist.length > 0);
    }
  }

  // initial render
  updateNavbarCounts();

  // keep counts updated on storage changes from other tabs
  window.addEventListener('storage', function (e) {
    if (!e.key) return;
    if (['wearopia_cart_v1', 'wearopia_wishlist', 'wishlist'].includes(e.key)) updateNavbarCounts();
  });

})(); // end IIFE