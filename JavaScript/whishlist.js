// Wishlist page renderer. Uses window.WishlistAPI when available.
// Ensures "View" sets localStorage.selected_product before navigation.

(function () {
  const WKEY = 'wearopia_wishlist';
  const PRODUCTS_URL = 'product_data.json';

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else node.setAttribute(k, attrs[k]);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      if (typeof c === 'string' || typeof c === 'number') node.appendChild(document.createTextNode(String(c)));
      else node.appendChild(c);
    });
    return node;
  }

  async function loadProductsMap() {
    try {
      const res = await fetch(PRODUCTS_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to fetch product data');
      const data = await res.json();
      const map = new Map();
      data.forEach(p => map.set(Number(p.id), p));
      return map;
    } catch (e) {
      console.error('Could not load products:', e);
      return new Map();
    }
  }

  function getIds() {
    if (window.WishlistAPI && typeof window.WishlistAPI.getAll === 'function') return window.WishlistAPI.getAll();
    try { return JSON.parse(localStorage.getItem(WKEY) || '[]'); } catch { return []; }
  }

  async function renderWishlist() {
    let wishlist = JSON.parse(localStorage.getItem("wearopia_wishlist")) || [];
    const container = document.getElementById('wishlistItems');
    if (!container) return;
    const productsMap = await loadProductsMap();
    const ids = getIds();
    if (!ids || !ids.length) {
      container.innerHTML = "<p class='text-center text-muted'>Your wishlist is empty ❤️</p>";
      updateBadge(0);
      return;
    }

    container.innerHTML = '';
    ids.forEach(id => {
      const p = productsMap.get(Number(id));
      if (!p) return;
      const img = el('img', { src: p.image || 'Images/Image.png', class: 'img-fluid', alt: p.name });
      const title = el('h4', { class: 'mb-1' }, p.name);
      const price = el('p', { class: 'mb-1 fw-bold' }, `$${Number(p.price).toFixed(2)}`);
      const info = el('div', { class: 'wishlist-info' }, [title, price]);

      const btnRemove = el('button', { class: 'btn btn-sm btn-outline-danger me-2' }, 'Remove');
      btnRemove.addEventListener('click', () => {
        if (window.WishlistAPI && typeof window.WishlistAPI.remove === 'function') {
          window.WishlistAPI.remove(p.id);
        } else {
          let raw = [];
          try { raw = JSON.parse(localStorage.getItem(WKEY) || '[]'); } catch { raw = []; }
          const filtered = raw.filter(x => Number(x) !== Number(p.id));
          localStorage.setItem(WKEY, JSON.stringify(filtered));
          // mirror legacy object for older pages
          try { localStorage.setItem('wishlist', JSON.stringify(Object.fromEntries(filtered.map(i => [String(i), true])))); } catch (e) {}
        }
        renderWishlist();
        if (window.NavbarComponent && typeof window.NavbarComponent.updateCounts === 'function') window.NavbarComponent.updateCounts();
        if (window.Swal) Swal.fire({ icon: 'success', title: 'Removed from wishlist', timer: 1000, showConfirmButton: false });
      });

      const btnView = el('button', { class: 'btn btn-sm btn-outline-secondary' }, 'View');
      btnView.addEventListener('click', () => {
        // Set selected_product so product-details can read it immediately
        localStorage.setItem('selected_product', JSON.stringify(p));
        // navigate
        window.location.href = `product-details.html`;
      });

      const actions = el('div', { class: 'wishlist-actions mt-2' }, [btnRemove, btnView]);

      const item = el('div', { class: 'wishlist-item d-flex align-items-center justify-content-between my-3' }, [
        el('div', { class: 'd-flex align-items-center gap-3' }, [el('div', { class: 'thumb' }, img), info]),
        actions
      ]);

      container.appendChild(item);
    });

    updateBadge(ids.length);
  }

  function updateBadge(n) {
    const badge = document.getElementById('wishlistCount');
    if (badge) badge.textContent = String(n);
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderWishlist();
    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      if (e.key === WKEY || e.key === 'wishlist') renderWishlist();
    });
  });
})();
