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

//  featured products


let products = JSON.parse(localStorage.getItem("products")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
const productRow = document.getElementById("product-row");

function displayProducts(list) {
  productRow.innerHTML = ""; 

  list.slice(0, 8).forEach((product) => {
    const isInWishlist = wishlist.some((item) => item.id === product.id);

    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    col.innerHTML = `
      <div class="card bg-white border-0 rounded-4 shadow-sm overflow-hidden custom-card h-100">
        <div class="position-relative">
          <img src="${product.image}" class="card-img-top object-fit-cover custom-img" alt="${product.name}">
          <button class="wishlist-btn position-absolute top-0 end-0 m-2 btn btn-light rounded-circle p-2 ${
            isInWishlist ? "active" : ""
          }" data-id="${product.id}">
            <i class="${isInWishlist ? "fa-solid" : "fa-regular"} fa-heart"></i>
          </button>
        </div>
        <div class="p-3 text-start">
          <h6 class="fw-semibold text-dark mb-2">${product.name}</h6>
          <div class="d-flex align-items-center">
            <span class="fw-semibold text-dark me-2">$${product.price.toFixed(2)}</span>
            ${
              product.oldPrice
                ? `<span class="text-decoration-line-through text-muted small">$${product.oldPrice.toFixed(
                    2
                  )}</span>`
                : ""
            }
          </div>
        </div>
      </div>
    `;

    productRow.appendChild(col);
  });

  activateWishlistButtons();
}

function activateWishlistButtons() {
  document.querySelectorAll(".wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.getAttribute("data-id");
      const product = products.find((p) => p.id == productId);
      const icon = btn.querySelector("i");

      btn.classList.toggle("active");

      if (btn.classList.contains("active")) {
        icon.classList.replace("fa-regular", "fa-solid");
        if (!wishlist.some((item) => item.id === product.id)) {
          wishlist.push(product);
        }
      } else {
        icon.classList.replace("fa-solid", "fa-regular");
        wishlist = wishlist.filter((item) => item.id !== product.id);
      }

      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    });
  });
}


displayProducts(products);

// end of featured products

