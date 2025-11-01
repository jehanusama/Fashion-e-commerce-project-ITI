function loadNavbar() {
  const navbarHTML = `
    <nav class="navbar-wrapper">
      <nav class="navbar">
        <a href="index.html" class="navbar-brand">Wearopia</a>

        <ul class="navbar-menu" id="navbarMenu">
          <li><a href="product-catalog.html?category=men">Man</a></li>
          <li><a href="product-catalog.html?category=women">Women</a></li>
          <li><a href="product-catalog.html?category=kids">Kids</a></li>
          <li><a href="product-catalog.html?category=accessory">Accessory</a></li>
        </ul>

        <div class="search-container">
          <i class="bi bi-search search-icon"></i>
          <input type="text" class="search-box" placeholder="Search for outfits...">
        </div>

        <div class="navbar-actions">

          <!-- Login (appears only when logged out) -->
          <a href="login.html" id="loginBtn">
            <i class="bi bi-box-arrow-in-right"></i>
            <span>Login</span>
          </a>

          <!-- Account Dropdown (appears only when logged in) -->
          <div class="dropdown" id="accountDropdown" style="display:none;">
            <a href="#" id="accountToggle">
              <i class="bi bi-person-circle"></i>
              <span id="accountName">Account</span>
            </a>
            <div class="dropdown-menu" id="accountMenu">
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
        <ul>
          <li><a href="product-catalog.html?category=men">Man</a></li>
          <li><a href="product-catalog.html?category=women">Women</a></li>
          <li><a href="product-catalog.html?category=kids">Kids</a></li>
          <li><a href="product-catalog.html?category=accessory">Accessory</a></li>
        </ul>
      </div>
    </nav>
  `;

  const container = document.getElementById('navbar-container') || document.getElementById('navbar');
  if (!container) return;
  container.innerHTML = navbarHTML;

  // --- Event listeners ---
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const accountDropdown = document.getElementById('accountDropdown');
  const accountMenu = document.getElementById('accountMenu');
  const accountToggle = document.getElementById('accountToggle');
  const logoutBtn = document.getElementById('logoutBtn');
  const searchBox = document.querySelector('.search-box');

  // Toggle mobile menu
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('show');
    });
  }

  // Toggle account dropdown
  if (accountToggle) {
    accountToggle.addEventListener('click', (e) => {
      e.preventDefault();
      accountMenu.classList.toggle('show');
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (accountMenu && !accountDropdown.contains(e.target)) {
      accountMenu.classList.remove('show');
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // use consistent key 'isLoggedIn'
      localStorage.setItem('isLoggedIn', 'false');
      // clear both possible user name keys used across the project
      localStorage.removeItem('userName');
      localStorage.removeItem('loggedInUser');
      renderAuthState(); // refresh view
    });
  }

  // Search functionality
  if (searchBox) {
    searchBox.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const q = encodeURIComponent(searchBox.value.trim());
        if (q) window.location.href = `product-catalog.html?q=${q}`;
      }
    });
    // Optional: click on the search icon (if you have one)
    const searchIcon = document.querySelector('.search-icon');
    if (searchIcon) {
      searchIcon.addEventListener('click', () => {
        const q = encodeURIComponent(searchBox.value.trim());
        if (q) window.location.href = `product-catalog.html?q=${q}`;
      });
    }
  }

  // Render user state and counts
  renderAuthState();
  updateNavbarCounts();
}

// 🔹 Show Login or Account dropdown depending on login state
function renderAuthState() {
  // use consistent key 'isLoggedIn' (capital I)
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // Prefer `loggedInUser` object (JSON), fallback to `userName` string
  let userName = 'Account';
  try {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    if (loggedInUser && (loggedInUser.name || loggedInUser.fullname || loggedInUser.email)) {
      userName = loggedInUser.name || loggedInUser.fullname || loggedInUser.email;
    } else {
      const storedName = localStorage.getItem('userName');
      if (storedName) userName = storedName;
    }
  } catch (err) {
    const storedName = localStorage.getItem('userName');
    if (storedName) userName = storedName;
  }

  const loginBtn = document.getElementById('loginBtn');
  const accountDropdown = document.getElementById('accountDropdown');
  const accountName = document.getElementById('accountName');

  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (accountDropdown) accountDropdown.style.display = 'inline-block';
    if (accountName) accountName.textContent = userName;
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (accountDropdown) accountDropdown.style.display = 'none';
  }
}

// 🔹 Update Wishlist & Cart numbers
function updateNavbarCounts() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  document.getElementById('wishlistCount').textContent = wishlist.length;
  document.getElementById('cartCount').textContent = cart.length;
}

// Auto-run when page loads
document.addEventListener('DOMContentLoaded', loadNavbar);

