console.log(" SignIn.js file is loaded!");
//  إضافة حساب أدمن ثابت (static admin) في localStorage لو مش موجود
document.addEventListener("DOMContentLoaded", function () {
  const secretKey = "mySecretKey";
  const adminUser = {
    fullname: "Admin",
    email: "adminreham@wearopia.com",
    password: "adminreham123",
    accountType: "admin",
  };

  // تحقق إذا كان الأدمن موجود في 3calStorage ولا لأ
  const encryptedData = localStorage.getItem("users");
  let users = [];

  if (encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    users = JSON.parse(decryptedData);
  }

  // لو الأدمن مش موجود، نضيفه
  const adminExists = users.some(
    (user) => user.email === adminUser.email
  );

  if (!adminExists) {
    users.push(adminUser);
    const encryptedUsers = CryptoJS.AES.encrypt(
      JSON.stringify(users),
      secretKey
    ).toString();
    localStorage.setItem("users", encryptedUsers);
    console.log(" Static admin account added to localStorage!");
  }
});


document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#loginForm");
  const secretKey = "mySecretKey";

  // إظهار / إخفاء كلمة المرور
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
  } else {
    console.error(" Password toggle elements not found!");
  }

  //  تسجيل الدخول
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    //  التحقق من الأدمن
    if (email === "admin@ecom.com" && password === "admin123") {
      const adminUser = { fullname: "Admin", email, accountType: "admin" };
      sessionStorage.setItem("loggedInUser", JSON.stringify(adminUser));

      Swal.fire({
        title: "Admin login successful!",
        text: "Redirecting to dashboard...",
        icon: "success",
      }).then(() => {
        window.location.href = "admin/admin.html";
      });
      return;
    }

    //  فك تشفير المستخدمين
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
      const bytes = CryptoJS.AES.decrypt(encryptedData, "mySecretKey");
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      const users = JSON.parse(decryptedData);

      const foundUser = users.find(
        (user) => user.email === email && user.password === password
      );

      if (foundUser) {
        sessionStorage.setItem("loggedInUser", JSON.stringify(foundUser));
        Swal.fire({
          title: "Login successful!",
          text: "Welcome back to Wearopia 💚",
          icon: "success",
        }).then(() => {
          window.location.href = "/admindashboard.html";
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
