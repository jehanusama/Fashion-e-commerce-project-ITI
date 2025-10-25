console.log("SignIn.js file is loaded!");

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#loginForm");
  const secretKey = "mySecretKey";

  // ====== إظهار / إخفاء كلمة المرور ======
  const toggleIcon = document.getElementById("togglePassword");
  const toggleText = document.getElementById("toggleText");
  const passwordInput = document.getElementById("password");

  function togglePasswordVisibility() {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";

    if (isHidden) {
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
      toggleText.textContent = "Hide";
    } else {
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
      toggleText.textContent = "Show";
    }
  }

  if (toggleIcon && toggleText && passwordInput) {
    toggleIcon.addEventListener("click", togglePasswordVisibility);
    toggleText.addEventListener("click", togglePasswordVisibility);
  }

  // ====== تسجيل الدخول ======
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // التحقق من الأدمن الثابت
    if (email === "adminreham@wearopia.com" && password === "adminreham123") {
      const adminUser = { fullname: "Admin", email, role: "admin" };
      localStorage.setItem("loggedInUser", JSON.stringify(adminUser));
      localStorage.setItem("isLoggedIn", "true");

      Swal.fire({
        title: "Welcome Admin!",
        text: "Redirecting to admin dashboard...",
        icon: "success",
      }).then(() => {
        window.location.href = "/admindashboard.html";
      });
      return;
    }

    // فك تشفير المستخدمين
    const encryptedData = localStorage.getItem("users");
    if (!encryptedData) {
      Swal.fire({
        title: "No account found",
        text: "Please register first.",
        icon: "error",
      });
      return;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      const users = JSON.parse(decryptedData);

      // البحث عن المستخدم
      const foundUser = users.find(
        (user) => user.email === email && user.password === password
      );

      if (foundUser) {
        localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
        localStorage.setItem("isLoggedIn", "true");

        let redirectUrl = "index.html"; // افتراضي

        if (foundUser.role === "seller") {
          redirectUrl = "seller-dashboard.html";
        } else if (
          foundUser.role === "admin" ||
          foundUser.accountType === "admin"
        ) {
          redirectUrl = "admindashboard.html";
        }

        Swal.fire({
          title: "Login successful!",
          text: `Welcome back, ${foundUser.name || foundUser.fullname}! 💚`,
          icon: "success",
        }).then(() => {
          window.location.href = redirectUrl;
        });
      } else {
        Swal.fire({
          title: "Invalid email or password!",
          icon: "error",
        });
      }
    } catch (err) {
      console.error("Decryption error:", err);
      Swal.fire({
        title: "Something went wrong!",
        text: "Please try again later.",
        icon: "error",
      });
    }
  });
});
