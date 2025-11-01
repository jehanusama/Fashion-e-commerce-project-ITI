// Renders featured products into #featured-products-row and uses the global WishlistAPI when available.

(async function () {
  const container = document.getElementById('featured-products-row');
  if (!container) return;

  function fmtPrice(v) { return Number(v).toFixed(2); }
  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function productCardHTML(p) {
    const oldPriceHtml = p.oldPrice ? `<div class="price-old" style="text-decoration:line-through;color:#999;font-size:.85rem">$${fmtPrice(p.oldPrice)}</div>` : '';
    const img = p.image || 'Images/Image.png';
    return `
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="custom-card card h-100 border-0" data-product-id="${p.id}">
          <div style="height:280px; overflow:hidden;">
            <img src="${escapeHtml(img)}" class="card-img-top custom-img" alt="${escapeHtml(p.name)}">
          </div>
          <div class="card-body d-flex flex-column">
            <h6 class="card-title mb-2" style="font-weight:600">${escapeHtml(p.name)}</h6>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <div>
                <div class="price-current" style="color:#0f6546;font-weight:700">$${fmtPrice(p.price)}</div>
                ${oldPriceHtml}
              </div>
              <button class="btn btn-sm btn-outline-secondary add-wishlist" data-id="${p.id}" title="Wishlist">
                <i class="fa-regular fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async function loadProducts() {
    try {
      const res = await fetch('product_data.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to load product_data.json', err);
      return [];
    }
  }

  const products = await loadProducts();
  if (!products || products.length === 0) {
    container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No featured products available.</p></div>';
    return;
  }

  // choose featured: first 8 items
  const featured = products.slice(0, 8);
  container.innerHTML = featured.map(productCardHTML).join('');

  // Use WishlistAPI when available, otherwise fallback to localStorage array
  function getWishlist() {
    if (window.WishlistAPI && typeof window.WishlistAPI.getAll === 'function') return window.WishlistAPI.getAll();
    try { return JSON.parse(localStorage.getItem('wearopia_wishlist') || '[]'); } catch { return []; }
  }
  function isInWishlist(id) {
    if (window.WishlistAPI && typeof window.WishlistAPI.isInWishlist === 'function') return window.WishlistAPI.isInWishlist(id);
    return getWishlist().includes(Number(id));
  }
  function toggleWishlist(id, uiButton, icon) {
    if (window.WishlistAPI && typeof window.WishlistAPI.toggle === 'function') {
      const added = window.WishlistAPI.toggle(id);
      // WishlistAPI.toggle returns true when added, false when removed (our API behaves like that)
      if (added) {
        uiButton.classList.add('active');
        if (icon) icon.classList.replace('fa-regular', 'fa-solid');
      } else {
        uiButton.classList.remove('active');
        if (icon) icon.classList.replace('fa-solid', 'fa-regular');
      }
    } else {
      // fallback: read/write array
      let wl = getWishlist().map(Number);
      id = Number(id);
      if (wl.includes(id)) {
        wl = wl.filter(x => x !== id);
        uiButton.classList.remove('active');
        if (icon) icon.classList.replace('fa-solid', 'fa-regular');
      } else {
        wl.push(id);
        uiButton.classList.add('active');
        if (icon) icon.classList.replace('fa-regular', 'fa-solid');
      }
      localStorage.setItem('wearopia_wishlist', JSON.stringify(wl));
      // mirror legacy object for older pages if they need it
      try { localStorage.setItem('wishlist', JSON.stringify(Object.fromEntries(wl.map(i => [String(i), true])))); } catch (e) {}
      // update global navbar counts if available
      if (window.NavbarComponent && typeof window.NavbarComponent.updateCounts === 'function') window.NavbarComponent.updateCounts();
    }
  }

  // Init button states and handlers
  container.querySelectorAll('.add-wishlist').forEach(btn => {
    const id = Number(btn.dataset.id);
    const icon = btn.querySelector('i');
    if (isInWishlist(id)) {
      btn.classList.add('active');
      if (icon) icon.classList.replace('fa-regular', 'fa-solid');
    }
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent card click
      toggleWishlist(id, btn, icon);
    });
  });

  // clicking a card navigates to details (store selected_product)
  container.querySelectorAll('.custom-card').forEach(card => {
    card.addEventListener('click', () => {
      const productId = Number(card.getAttribute('data-product-id'));
      const product = products.find(p => Number(p.id) === productId);
      if (product) {
        localStorage.setItem('selected_product', JSON.stringify(product));
        // Navigate synchronously so product-details can read selected_product immediately
        window.location.href = 'product-details.html';
      } else {
        console.warn('Clicked product not found:', productId);
      }
    });
  });

  // react to storage changes (other tabs)
  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key === 'wearopia_wishlist' || e.key === 'wishlist') {
      // update UI to reflect new state
      container.querySelectorAll('.add-wishlist').forEach(btn => {
        const id = Number(btn.dataset.id);
        const icon = btn.querySelector('i');
        if (isInWishlist(id)) {
          btn.classList.add('active');
          if (icon) icon.classList.replace('fa-regular', 'fa-solid');
        } else {
          btn.classList.remove('active');
          if (icon) icon.classList.replace('fa-solid', 'fa-regular');
        }
      });
      if (window.NavbarComponent && typeof window.NavbarComponent.updateCounts === 'function') window.NavbarComponent.updateCounts();
    }
  });

})();