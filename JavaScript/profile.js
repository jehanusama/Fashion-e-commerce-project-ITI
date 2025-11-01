document.addEventListener("DOMContentLoaded", function () {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser) {
        const profileName = document.querySelector(".profile-name");
        const profileEmail = document.querySelector(".profile-email");
        const profileSection = document.querySelector(".profile-section");

        if (profileName) {
            profileName.textContent = loggedInUser.name || "User";
        }

        if (profileEmail) {
            profileEmail.textContent = loggedInUser.email;
        }

        if (loggedInUser.role === 'seller' && loggedInUser.storeAddress) {
            const storeAddressElement = document.createElement('div');
            storeAddressElement.className = 'profile-store-address';
            storeAddressElement.textContent = loggedInUser.storeAddress;
            storeAddressElement.style.fontSize = '0.875rem';
            storeAddressElement.style.color = '#6b7280';
            profileSection.insertBefore(storeAddressElement, profileEmail.nextSibling);
        }
    }
});