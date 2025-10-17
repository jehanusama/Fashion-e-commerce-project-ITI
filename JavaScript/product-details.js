document.querySelectorAll('.thumb[data-src]').forEach(el => {
  el.addEventListener('click', function () {
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('border-success', 'active'));
    document.getElementById('mainImage').src = this.dataset.src;
    this.classList.add('border-success', 'active');
  });
});
const sizeButtons = document.querySelectorAll('.size-btn');
const selectedSizeText = document.getElementById('selectedSize');
sizeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sizeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedSizeText.textContent = btn.textContent;
  });
});

const colorButtons = document.querySelectorAll('[data-color]');
const selectedColorText = document.getElementById('selectedColor');
colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    colorButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedColorText.textContent = btn.getAttribute('data-color');
  });
});

function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toastContainer");
  const toastId = `toast-${Date.now()}`;
  const bg = type === "success" ? "bg-success" : "bg-danger";
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-white ${bg} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  toastContainer.insertAdjacentHTML("beforeend", toastHTML);
  const toastEl = new bootstrap.Toast(document.getElementById(toastId), { delay: 2500 });
  toastEl.show();

  document.getElementById(toastId).addEventListener('hidden.bs.toast', () => {
    document.getElementById(toastId).remove();
  });
}

const addToCartBtn = document.querySelector(".add-to-cart-btn");
addToCartBtn.addEventListener("click", () => {
  const product = {
    name: document.querySelector("h2").textContent,
    price: document.querySelector(".h4").textContent,
    size: selectedSizeText.textContent,
    color: selectedColorText.textContent,
    image: document.getElementById("mainImage").src
  };
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast("Added to cart successfully!");
});

const wishBtn = document.querySelector(".btn.p-2");
wishBtn.addEventListener("click", () => {
  const product = {
    name: document.querySelector("h2").textContent,
    price: document.querySelector(".h4").textContent,
    image: document.getElementById("mainImage").src
  };
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist.push(product);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  showToast("Added to wishlist!");
});