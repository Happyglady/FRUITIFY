// js/utils.js
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerHTML = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function updateBadges() {
    const cartCount = document.getElementById('cartCount');
    const wishlistCount = document.getElementById('wishlistCount');
    if (cartCount) cartCount.textContent = getCartCount();
    if (wishlistCount) wishlistCount.textContent = getWishlistCount();
}

function renderRipenessBar(ripeness) {
    return `<div class="ripeness-bar"><div class="ripeness-fill" style="width: ${ripeness}%"></div></div>`;
}

function formatPrice(price) {
    const amount = Math.round(price);
    return `Ugx ${amount.toLocaleString()}`;
}

// Mobile menu
document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    updateBadges();
    
    const wishlistBtn = document.getElementById('wishlistBtn');
    const cartBtn = document.getElementById('cartBtn');
    if (wishlistBtn) wishlistBtn.addEventListener('click', () => window.location.href = 'wishlist.html');
    if (cartBtn) cartBtn.addEventListener('click', () => window.location.href = 'cart.html');
});