//  Unified Signup Script for Customer & Seller
document.addEventListener("DOMContentLoaded", function () {
  //  Password toggle (Show/Hide)
  document.querySelectorAll(".password-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const openIcon = btn.querySelector(".eye-open");
      const closedIcon = btn.querySelector(".eye-closed");
      const text = btn.querySelector(".toggle-text");
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      openIcon.style.display = isHidden ? "none" : "block";
      closedIcon.style.display = isHidden ? "block" : "none";
      text.textContent = isHidden ? "Hide" : "Show";
    });
  });

  //  Detect which form (Customer or Seller)
  const isSellerForm = document.getElementById("sellerSignupForm") !== null;
  const form = isSellerForm
    ? document.getElementById("sellerSignupForm")
    : document.getElementById("signupForm");

  //  Field IDs for each form type
  const fields = isSellerForm
    ? ["storeName", "storeAddress", "email", "password", "confirmPassword"]
    : ["name", "email", "password", "confirmPassword" ];

  //  Regex patterns
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  //  Validate field on input/blur
  fields.forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", () => validateField(input));
    input.addEventListener("blur", () => validateField(input));
  });

  function validateField(input) {
    let message = "";
    if ((input.id === "name" || input.id === "storeName") && input.value.trim().length < 3)
      message = "Name must be at least 3 characters";
    if (input.id === "storeAddress" && input.value.trim().length < 3)
      message = "Store Address must be at least 3 characters";
    if (input.id === "email" && !emailPattern.test(input.value))
      message = "Enter a valid email address";
    if (input.id === "password" && !passwordPattern.test(input.value))
      message =
        "Password must be 8+ chars, include uppercase, lowercase, number & symbol";
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

  //  On Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    fields.forEach((id) => {
      const el = document.getElementById(id);
      validateField(el);
      if (el.classList.contains("error")) valid = false;
    });
    if (!valid) {
      Swal.fire({
        title: "Invalid Form!",
        text: "Please fix the highlighted errors before submitting.",
        icon: "error",
      });
      return;
    }

    //  Get values
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const name = isSellerForm
      ? document.getElementById("storeName").value.trim()
      : document.getElementById("name").value.trim();

    const storeAddress = isSellerForm
      ? document.getElementById("storeAddress").value.trim()
      : "";

    const role = isSellerForm ? "seller" : "customer";

    //  Load existing users from localStorage
    const existingUsersEncrypted = localStorage.getItem("users");
    let users = [];

    if (existingUsersEncrypted) {
      try {
        const bytes = CryptoJS.AES.decrypt(existingUsersEncrypted, "mySecretKey");
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        users = JSON.parse(decryptedData);
      } catch (e) {
        users = [];
      }
    }

    //  Check if email already exists
    const isEmailToken = users.some((u) => u.email === email);
    if (isEmailToken) {
      Swal.fire({
        title: "Email Already Registered!",
        text: "Please use another email address.",
        icon: "error",
      });
      return;
    }

    //  Create new user
    const newUser = {
      name,
      storeAddress,
      email,
      password,
      role,
    };

    users.push(newUser);

    //  Encrypt and save back
    const updatedUsersEncrypted = CryptoJS.AES.encrypt(
      JSON.stringify(users),
      "mySecretKey"
    ).toString();
    localStorage.setItem("users", updatedUsersEncrypted);

    // Sweet Alert success message
    Swal.fire({
      title: "Account Created Successfully!",
      text: `Welcome to Wearopia as a ${role}!`,
      icon: "success",
    }).then(() => {
      form.reset();
      window.location.href = "index.html";
    });
  });
});
