
document.addEventListener("DOMContentLoaded", function() {
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  const cardFields = document.getElementById("cardFields");
  const orderItemsContainer = document.getElementById("orderItemsContainer");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const discountValueEl = document.getElementById("discountValue");
  const shippingCostEl = document.getElementById("shippingCost");

  // ---------- Validation Helpers ----------
  function showError(field, message) {
    field.classList.add("error-border");
    let errorEl = field.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("error-msg")) {
      errorEl = document.createElement("div");
      errorEl.classList.add("error-msg");
      field.parentNode.insertBefore(errorEl, field.nextSibling);
    }
    errorEl.textContent = message;
  }

  function clearError(field) {
    field.classList.remove("error-border");
    let errorEl = field.nextElementSibling;
    if (errorEl && errorEl.classList.contains("error-msg")) {
      errorEl.textContent = "";
    }
  }

  function validateField(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      showError(field, message);
      field.focus();
      return false;
    } else {
      clearError(field);
      return true;
    }
  }

  function validateEmail(fieldId) {
    const field = document.getElementById(fieldId);
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(field.value)) {
      showError(field, "Please enter a valid email.");
      field.focus();
      return false;
    } else {
      clearError(field);
      return true;
    }
  }

  function validatePhone(fieldId) {
    const field = document.getElementById(fieldId);
    const re = /^[0-9]{7,15}$/;
    if (!re.test(field.value)) {
      showError(field, "Please enter a valid phone number.");
      field.focus();
      return false;
    } else {
      clearError(field);
      return true;
    }
  }

  function validateAll() {
    let valid = true;
    valid = validateField("firstName", "First name is required.") && valid;
    valid = validateField("phone", "Phone number is required.") && valid;
    valid = validatePhone("phone") && valid;
    valid = validateField("email", "Email is required.") && valid;
    valid = validateEmail("email") && valid;
    valid = validateField("address", "Address is required.") && valid;
    valid = validateField("country", "Country is required.") && valid;
    valid = validateField("city", "City is required.") && valid;

    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return false;
    }

    if (paymentMethod === "Credit Card") {
      valid = validateField("cardNumber", "Card number is required.") && valid;
      valid = validateField("expiryDate", "Expiration date is required.") && valid;
      valid = validateField("cvc", "CVC is required.") && valid;
    }

    return valid;
  }

  // ---------- Payment Selection ----------
  window.selectPayment = function(el) {
    document.querySelectorAll(".payment-option").forEach(opt => {
      opt.classList.remove("active");
      opt.querySelector("input").checked = false;
    });
    el.classList.add("active");
    el.querySelector("input").checked = true;
    cardFields.style.display = el.querySelector("input").value === "Credit Card" ? "block" : "none";
  };

  // ---------- Order Placement ----------
  function placeOrder() {
    const cart = JSON.parse(localStorage.getItem("wearopia_cart")) || {};
    const allProducts = JSON.parse(localStorage.getItem("wearopia_products")) || {};

    const orderItems = Object.keys(cart).map(id => {
      const product = allProducts[id] || {};
      return {
        id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: cart[id]
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = subtotal > 100 ? subtotal * 0.1 : 0;
    const shippingCost = 0;
    const total = subtotal - discount + shippingCost;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // --- Build full checkout JSON dynamically ---
    const checkoutData = {
      checkoutId: "chk_" + Date.now(),
      user: {
        firstName: document.getElementById("firstName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        country: document.getElementById("country").value,
        city: document.getElementById("city").value
      },
      cart: orderItems,
      payment: {
        method: paymentMethod,
        status: "Paid"
      },
      shipping: {
        method: "Standard Delivery",
        status: "Processing"
      },
      summary: {
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        total: total.toFixed(2)
      },
      createdAt: new Date().toISOString()
    };

    // Save checkout data in localStorage
    localStorage.setItem("wearopia_checkout", JSON.stringify(checkoutData));

    // Optionally let the user download JSON file
    const blob = new Blob([JSON.stringify(checkoutData, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `checkout_${Date.now()}.json`;
    link.click();

    // Clear cart + redirect
    localStorage.removeItem("wearopia_cart");
    sessionStorage.setItem("wearopia_order_complete", JSON.stringify(checkoutData));
    window.location.href = "complete-order.html";
  }

  placeOrderBtn.addEventListener("click", function() {
    if (validateAll()) {
      placeOrder();
    }
  });

  // ---------- Order Summary ----------
  function renderOrderSummary() {
    orderItemsContainer.innerHTML = "";
    let subtotal = 0;
    const cart = JSON.parse(localStorage.getItem("wearopia_cart")) || {};
    const allProducts = JSON.parse(localStorage.getItem("wearopia_products")) || {};

    if (Object.keys(cart).length === 0) {
      orderItemsContainer.innerHTML = "<p class='text-center text-muted py-3'>No items in your cart.</p>";
    }

    Object.keys(cart).forEach(id => {
      const product = allProducts[id];
      if (!product) return;
      const quantity = cart[id];
      const totalPrice = product.price * quantity;
      subtotal += totalPrice;

      orderItemsContainer.innerHTML += `
        <div class="d-flex align-items-center py-2 gap-3">
          <img src="${product.image}" alt="${product.name}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;">
          <div class="flex-grow-1">
            <div>${product.name}</div>
            <div class="text-muted">Qty: ${quantity}</div>
          </div>
          <div>$${totalPrice.toFixed(2)}</div>
        </div>
      `;
    });

    const discount = subtotal > 100 ? subtotal * 0.1 : 0;
    discountValueEl.textContent = discount > 0 ? "-$" + discount.toFixed(2) : "$0.00";
    subtotalEl.textContent = "$" + subtotal.toFixed(2);
    const shipping = 0;
    shippingCostEl.textContent = shipping === 0 ? "Free" : "$" + shipping.toFixed(2);
    totalEl.textContent = "$" + (subtotal + shipping - discount).toFixed(2);
  }

  renderOrderSummary();
});

