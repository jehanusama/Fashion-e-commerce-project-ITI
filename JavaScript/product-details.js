/*navbar */
//navbar
// Variables
let wishlistCount = 0;
let cartCount = 0;

const wishlistBadge = document.getElementById('wishlistCount');
const cartBadge = document.getElementById('cartCount');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

// Add to Wishlist
function addToWishlist() {
  wishlistCount++;
  wishlistBadge.textContent = wishlistCount;
  wishlistBadge.classList.add('show');
}

// Add to Cart
function addToCart() {
  cartCount++;
  cartBadge.textContent = cartCount;
  cartBadge.classList.add('show');
}

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('show');
  const icon = menuToggle.querySelector('i');
  
  if (mobileMenu.classList.contains('show')) {
    icon.classList.remove('bi-list');
    icon.classList.add('bi-x');
  } else {
    icon.classList.remove('bi-x');
    icon.classList.add('bi-list');
  }
});

// Close mobile menu when clicking on links
const mobileLinks = mobileMenu.querySelectorAll('a');
mobileLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    mobileLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    if (window.innerWidth <= 768) {
      mobileMenu.classList.remove('show');
      const icon = menuToggle.querySelector('i');
      icon.classList.remove('bi-x');
      icon.classList.add('bi-list');
    }
  });
});

// Desktop menu active state
const desktopLinks = document.querySelectorAll('.navbar-menu a');


desktopLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    desktopLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});
//end of navbar
/*end of navbar */

/*product details*/
const CART_KEY = 'wearopia_cart_v1';
const WISHLIST_KEY = 'wearopia_wishlist';


const product = {
  id: 'prod_jogger_001',
  name: 'Grey Acid Wash Wide Leg Jogger',
  price: 215.00,
  image: 'Images/shoes.png',
  color: 'Black',
  size: 'XS'
};


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
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}


function saveWishlist(arr) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(arr));
}


function showToast(title, msg) {
  const container = document.getElementById('toastContainer');
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


document.querySelectorAll('.thumb').forEach(thumb => {
  thumb.addEventListener('click', function() {
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('mainImage').src = this.dataset.src;
  });
});


document.querySelectorAll('.color-circle').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.color-circle').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    const color = this.dataset.color;
    document.getElementById('selectedColor').textContent = color;
    product.color = color;
  });
});

document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('selectedSize').textContent = this.textContent.trim();
    product.size = this.textContent.trim();
  });
});


const addToCartBtn = document.querySelector('.add-to-cart-btn');
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', () => {
    const state = loadCart();
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
  });
}

const addToWishlistBtn = document.querySelector('.btn i.bi-heart')?.closest('.btn');
if (addToWishlistBtn) {
  addToWishlistBtn.addEventListener('click', () => {
    const wl = loadWishlist();
    if (!wl.includes(product.id)) {
      wl.push(product.id);
      saveWishlist(wl);
      showToast('Added to Wishlist', 'You can view it in your wishlist');
    } else {
      showToast('Already in Wishlist', 'This product is already saved');
    }
  });
}
// ===== Sync navbar counters with localStorage =====
function updateNavbarCounts() {
  // Cart
  const cart = JSON.parse(localStorage.getItem('wearopia_cart_v1')) || { items: [] };
  const totalCartItems = cart.items.reduce((sum, item) => sum + (item.qty || 1), 0);
  cartBadge.textContent = totalCartItems;
  cartBadge.classList.toggle('show', totalCartItems > 0);

  // Wishlist
  const wishlist = JSON.parse(localStorage.getItem('wearopia_wishlist')) || [];
  wishlistBadge.textContent = wishlist.length;
  wishlistBadge.classList.toggle('show', wishlist.length > 0);
}

// Call once when the page loads
updateNavbarCounts();

// Also call it again after adding to cart or wishlist
document.querySelector('.add-to-cart-btn')?.addEventListener('click', updateNavbarCounts);
document.querySelector('.btn i.bi-heart')?.closest('.btn')?.addEventListener('click', updateNavbarCounts);

/* end of product details*/