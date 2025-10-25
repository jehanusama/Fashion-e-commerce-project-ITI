console.log('🔐 Login page loaded');

const togglePassword = document.getElementById("togglePassword");
const toggleText = document.getElementById("toggleText");
const password = document.getElementById("password");

function togglePasswordVisibility() {
    if (password.type === "password") {
        password.type = "text";
        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");
        toggleText.textContent = "Hide";
    } else {
        password.type = "password";
        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");
        toggleText.textContent = "Show";
    }
}

if (togglePassword && toggleText && password) {
    togglePassword.addEventListener("click", togglePasswordVisibility);
    toggleText.addEventListener("click", togglePasswordVisibility);
}

// Login Form Handler
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // حفظ حالة الـ login في localStorage
        localStorage.setItem('isLoggedIn', 'true');
        
        // الانتقال للصفحة الرئيسية
        window.location.href = 'index.html';
    });
} else {
    // لو الفورم مش موجود، ممكن يكون زر Login عادي
    const loginButton = document.querySelector('button[type="submit"]');
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'index.html';
        });
    }
}