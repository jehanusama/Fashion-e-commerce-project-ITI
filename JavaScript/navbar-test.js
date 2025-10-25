function initNavbar() {
  // قراءة حالة الـ Login من localStorage
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  // تحديث الـ Badges
  function updateBadge(id, count) {
    const badge = document.getElementById(id);
    if (badge) {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.add("show");
      } else {
        badge.classList.remove("show");
      }
    }
  }

  // تحديث واجهة الـ User (Login/Account)
  function updateUserUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (!loginBtn) {
      console.error('Login button not found!');
      return;
    }

    if (isLoggedIn) {
      // المستخدم مسجل دخول - غير الزر لـ Account
      loginBtn.innerHTML = '<i class="bi bi-person-circle"></i><span>Account</span>';
      
      // اعمل الزر يفتح الـ dropdown
      loginBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (userMenu) {
          userMenu.classList.toggle('show');
        }
      };
    } else {
      // المستخدم مش مسجل دخول - غير الزر لـ Login
      loginBtn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i><span>Login</span>';
      
      // اعمل الزر يروح لصفحة الـ login
      loginBtn.onclick = function(e) {
        e.preventDefault();
        window.location.href = 'login.html';
      };
      
      if (userMenu) {
        userMenu.classList.remove('show');
      }
    }
  }

  // تحديث كل حاجة
  updateBadge("wishlistCount", wishlist.length);
  updateBadge("cartCount", cart.length);
  updateUserUI();

  // Logout Button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = function(e) {
      e.preventDefault();
      
      // امسح الـ login state
      localStorage.removeItem('isLoggedIn');
      
      // روح للصفحة الرئيسية
      window.location.href = 'index.html';
    };
  }

  // إغلاق الـ dropdown لما تضغطي برا
  document.addEventListener('click', function(e) {
    const userDropdown = document.getElementById('userDropdownWrapper');
    const userMenu = document.getElementById('userMenu');
    
    if (userDropdown && userMenu && !userDropdown.contains(e.target)) {
      userMenu.classList.remove('show');
    }
  });

  // Search Box
  const searchBox = document.querySelector('.search-box');
  if (searchBox) {
    searchBox.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.value.trim();
        if (query) {
          window.location.href = 'search.html?q=' + encodeURIComponent(query);
        }
      }
    });
  }
}

// دالة لتحديث الـ badges من أي صفحة
function updateNavbarBadges() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  
  const cartBadge = document.getElementById('cartCount');
  const wishlistBadge = document.getElementById('wishlistCount');
  
  if (cartBadge) {
    cartBadge.textContent = cart.length;
    if (cart.length > 0) {
      cartBadge.classList.add("show");
    } else {
      cartBadge.classList.remove("show");
    }
  }
  
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlist.length;
    if (wishlist.length > 0) {
      wishlistBadge.classList.add("show");
    } else {
      wishlistBadge.classList.remove("show");
    }
  }
}

// استمع لتغييرات localStorage من tabs تانية
window.addEventListener('storage', function(e) {
  if (e.key === 'cart' || e.key === 'wishlist' || e.key === 'isLoggedIn') {
    updateNavbarBadges();
    if (e.key === 'isLoggedIn') {
      initNavbar();
    }
  }
});
$('#logoutBtn').on('click', function (e) {
  e.preventDefault();
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("loggedInUser");

  Swal.fire({
    title: "Logged out!",
    text: "You have been signed out successfully.",
    icon: "success",
  }).then(() => {
    window.location.href = "index.html";
  });
});

let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

if (isLoggedIn && loggedInUser) {
  $("#loginBtn").html('<i class="bi bi-person-circle"></i><span>Account</span>');
} else {
  $("#loginBtn").html('<i class="bi bi-box-arrow-in-right"></i><span>Login</span>');
}

