// js/wishlist.js
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function getWishlistCount() {
    return wishlist.length;
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateBadges();
}

function toggleWishlist(productId) {
    const index = wishlist.findIndex(item => item.id === productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('Removed from wishlist');
    } else {
        const product = products.find(p => p.id === productId);
        wishlist.push(product);
        showToast('Added to wishlist <i class="fas fa-heart"></i>');
    }
    saveWishlist();
}

function isInWishlist(productId) {
    return wishlist.some(item => item.id === productId);
}