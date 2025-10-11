document.addEventListener("DOMContentLoaded", function () {
  // 👁️ Password toggle
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const openIcon = btn.querySelector('.eye-open');
      const closedIcon = btn.querySelector('.eye-closed');
      const text = btn.querySelector('.toggle-text');
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      openIcon.style.display = isHidden ? 'none' : 'block';
      closedIcon.style.display = isHidden ? 'block' : 'none';
      text.textContent = isHidden ? 'Hide' : 'Show';
    });
  });

  const form = document.getElementById("sellerSignupForm");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const fields = ["storeName", "storeAddress", "email", "password", "confirmPassword"];
  
  fields.forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener("input", () => validateField(input));
    input.addEventListener("blur", () => validateField(input));
  });

  function validateField(input) {
    let message = "";
    if (input.id === "storeName" && input.value.trim().length < 3)
      message = "Store Name must be at least 3 characters";
    if (input.id === "storeAddress" && input.value.trim().length < 3)
      message = "Store Address must be at least 3 characters";
    if (input.id === "email" && !emailPattern.test(input.value))
      message = "Enter a valid email address";
    if (input.id === "password" && !passwordPattern.test(input.value))
      message = "Password must be 8+ chars, include uppercase, lowercase, number & symbol";
    if (input.id === "confirmPassword") {
      const password = document.getElementById("password").value;
      if (input.value !== password) message = "Passwords do not match";
    }
    const errorEl = input.parentElement.querySelector(".error-message");
    if (message) {
      input.classList.add("error");
      errorEl.textContent = message;
    } else {
      input.classList.remove("error");
      errorEl.textContent = "";
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    fields.forEach((id) => {
      const el = document.getElementById(id);
      validateField(el);
      if (el.classList.contains("error")) valid = false;
    });

    if (!valid) return;

    const storeName = document.getElementById("storeName").value.trim();
    const storeAddress = document.getElementById("storeAddress").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // 🔒 استرجاع المستخدمين الموجودين
    const existingUsersEncrypted = localStorage.getItem("sellers");
    let sellers = [];

    if (existingUsersEncrypted) {
      const bytes = CryptoJS.AES.decrypt(existingUsersEncrypted, "mySecretKey");
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      sellers = JSON.parse(decryptedData);
    }

    // 🧩 التأكد من عدم تكرار الإيميل
    const isEmailTaken = sellers.some((seller) => seller.email === email);
    if (isEmailTaken) {
      Swal.fire({
        title: "Email Already Registered!",
        text: "Please use another email.",
        icon: "error",
      });
      return;
    }

    // ✅ حفظ المستخدم الجديد
    const newSeller = { storeName, storeAddress, email, password };
    sellers.push(newSeller);

    const updatedUsersEncrypted = CryptoJS.AES.encrypt(
      JSON.stringify(sellers),
      "mySecretKey"
    ).toString();

    localStorage.setItem("sellers", updatedUsersEncrypted);

    Swal.fire({
      title: "Account Created Successfully!",
      text: "Welcome to Wearopia! You can now sign in.",
      icon: "success",
    }).then(() => {
      form.reset();
      window.location.href = "login.html";
    });
  });
});
