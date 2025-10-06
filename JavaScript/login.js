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
togglePassword.addEventListener("click", togglePasswordVisibility);
toggleText.addEventListener("click", togglePasswordVisibility);
