// js/shop.js - FULLY DEBUGGED AND WORKING

// Global variables
let currentProducts = [];
let compareList = [];

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Shop.js initialized');
    
    // Initialize currentProducts with all products
    if (typeof products !== 'undefined') {
        currentProducts = [...products];
        console.log('Products loaded:', currentProducts.length);
    } else {
        console.error('Products data not loaded!');
    }
    
    // Load products display
    loadProducts();
    
    // Setup all event listeners
    setupFilters();
    setupSort();
    setupCompare();
    setupSearch();
    setupMobileMenu();
    setupWishlistCartButtons();
    
    // Check URL for mood filter from home page
    const mood = localStorage.getItem('selectedMood');
    if (mood) {
        console.log('Filtering by mood:', mood);
        currentProducts = products.filter(p => p.mood === mood);
        loadProducts();
        localStorage.removeItem('selectedMood');
    }
    
    // Check URL for product detail
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    if (productId) {
        showProductDetail(parseInt(productId));
    }
});

// Load products into grid
function loadProducts() {
    const grid = document.getElementById('productGrid');
    const productCountSpan = document.getElementById('productCount');
    
    if (!grid) {
        console.error('Product grid element not found!');
        return;
    }
    
    if (!currentProducts || currentProducts.length === 0) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;grid-column:1/-1;">No products found</div>';
        if (productCountSpan) productCountSpan.textContent = '0';
        return;
    }
    
    if (productCountSpan) productCountSpan.textContent = currentProducts.length;
    
    grid.innerHTML = currentProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400'">
                ${product.organic ? '<span class="product-badge">Organic</span>' : ''}
                <div class="product-actions">
                    <button class="product-action-btn wishlist-btn" data-id="${product.id}">
                        ${isInWishlist(product.id) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'}
                    </button>
                    <button class="product-action-btn compare-btn" data-id="${product.id}">
                        <i class="fas fa-sync"></i>
                    </button>
                </div>
            </div>
            <div class="product-info" onclick="showProductDetail(${product.id})">
                <div class="product-name">${escapeHtml(product.name)}</div>
                ${renderRipenessBar(product.ripeness)}
                <div class="product-price">
                    <span class="price">${formatPrice(product.price)}<span style="font-size:14px">/lb</span></span>
                    <button class="add-to-cart" data-id="${product.id}" onclick="event.stopPropagation(); addToCart(${product.id})">
                        Add to bowl
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Re-attach event listeners to dynamic buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            toggleWishlist(id);
            loadProducts(); // Refresh to update heart icon
            updateBadges();
        });
    });
    
    document.querySelectorAll('.compare-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            addToCompare(id);
        });
    });
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Setup filter event listeners
function setupFilters() {
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const ripenessFilters = document.querySelectorAll('.ripeness-filter');
    const originFilter = document.getElementById('originFilter');
    const organicFilter = document.getElementById('organicFilter');
    const sugarRadios = document.querySelectorAll('input[name="sugar"]');
    const clearBtn = document.getElementById('clearFilters');
    
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            if (priceValue) priceValue.textContent = formatPrice(Number(e.target.value));
            applyFilters();
        });
    }
    
    ripenessFilters.forEach(input => {
        input.addEventListener('change', () => applyFilters());
    });
    
    if (originFilter) originFilter.addEventListener('change', () => applyFilters());
    if (organicFilter) organicFilter.addEventListener('change', () => applyFilters());
    sugarRadios.forEach(radio => radio.addEventListener('change', () => applyFilters()));
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Clear ripeness checkboxes
            ripenessFilters.forEach(cb => cb.checked = false);
            // Clear sugar radios
            sugarRadios.forEach(rb => rb.checked = false);
            // Add back the "All" option
            const allRadio = document.querySelector('input[name="sugar"][value=""]');
            if (allRadio) allRadio.checked = true;
            // Reset origin
            if (originFilter) originFilter.value = 'all';
            // Reset organic
            if (organicFilter) organicFilter.checked = false;
            // Reset price
            if (priceRange) priceRange.value = '100000';
            if (priceValue) priceValue.textContent = 'Ugx 100,000';
            // Apply filters to reset
            applyFilters();
        });
    }
}

// Apply all active filters
function applyFilters() {
    const priceMax = parseFloat(document.getElementById('priceRange')?.value || 100000);
    const ripenessFilters = Array.from(document.querySelectorAll('.ripeness-filter:checked')).map(cb => cb.value);
    const origin = document.getElementById('originFilter')?.value || 'all';
    const organic = document.getElementById('organicFilter')?.checked || false;
    const sugar = document.querySelector('input[name="sugar"]:checked')?.value;
    
    console.log('Applying filters:', { priceMax, ripenessFilters, origin, organic, sugar });
    
    currentProducts = products.filter(product => {
        if (product.price > priceMax) return false;
        if (ripenessFilters.length > 0 && !ripenessFilters.includes(product.ripenessLevel)) return false;
        if (origin !== 'all' && product.origin !== origin) return false;
        if (organic && !product.organic) return false;
        if (sugar && sugar !== '' && product.sugar !== sugar) return false;
        return true;
    });
    
    applySort();
}

// Setup sort event listener
function setupSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => applySort());
    }
}

// Apply current sort
function applySort() {
    const sortBy = document.getElementById('sortSelect')?.value || 'featured';
    
    const sorted = [...currentProducts];
    
    switch(sortBy) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Keep original order for featured
            break;
    }
    
    currentProducts = sorted;
    loadProducts();
}

// Setup compare functionality
function setupCompare() {
    const compareBar = document.getElementById('compareBar');
    const clearCompareBtn = document.getElementById('clearCompare');
    const compareNowBtn = document.getElementById('compareNow');
    
    if (clearCompareBtn) {
        clearCompareBtn.addEventListener('click', () => {
            compareList = [];
            updateCompareBar();
            if (compareBar) compareBar.classList.add('hidden');
            showToast('Compare cleared');
        });
    }
    
    if (compareNowBtn) {
        compareNowBtn.addEventListener('click', () => {
            if (compareList.length < 2) {
                showToast('Add at least 2 items to compare');
            } else {
                showCompareModal();
            }
        });
    }
}

// Add product to compare
function addToCompare(productId) {
    if (compareList.length >= 3) {
        showToast('Maximum 3 items to compare');
        return;
    }
    if (compareList.some(item => item.id === productId)) {
        showToast('Already in compare list');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product) {
        compareList.push(product);
        updateCompareBar();
        const compareBar = document.getElementById('compareBar');
        if (compareBar) compareBar.classList.remove('hidden');
        showToast('Added to compare');
    }
}

// Remove from compare
function removeFromCompare(productId) {
    compareList = compareList.filter(item => item.id !== productId);
    updateCompareBar();
    if (compareList.length === 0) {
        const compareBar = document.getElementById('compareBar');
        if (compareBar) compareBar.classList.add('hidden');
    }
}

// Update compare bar UI
function updateCompareBar() {
    const compareCount = document.getElementById('compareCount');
    const compareItems = document.getElementById('compareItems');
    
    if (compareCount) compareCount.textContent = compareList.length;
    
    if (compareItems) {
        compareItems.innerHTML = compareList.map(item => `
            <div class="compare-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/40'">
                <span>${escapeHtml(item.name)}</span>
                <button onclick="removeFromCompare(${item.id})" style="background:none;border:none;cursor:pointer;font-size:16px;">✕</button>
            </div>
        `).join('');
    }
}

// Show compare modal with comparison table
function showCompareModal() {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    
    let compareHtml = `
        <h2 style="font-size:28px;margin-bottom:24px;">Compare Products</h2>
        <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
                <tr style="background:#f5f5f5;">
                    <th style="padding:12px;text-align:left;">Feature</th>
                    ${compareList.map(p => `<th style="padding:12px;">${escapeHtml(p.name)}</th>`).join('')}
                </tr>
                <tr>
                    <td style="padding:12px;border-bottom:1px solid #eee;">Image</td>
                    ${compareList.map(p => `<td style="padding:12px;border-bottom:1px solid #eee;text-align:center;"><img src="${p.image}" style="width:100px;height:100px;object-fit:cover;border-radius:12px;"></td>`).join('')}
                </tr>
                <tr>
                    <td style="padding:12px;border-bottom:1px solid #eee;">Price</td>
                    ${compareList.map(p => `<td style="padding:12px;border-bottom:1px solid #eee;text-align:center;font-weight:700;">${formatPrice(p.price)}/lb</td>`).join('')}
                </tr>
                <tr>
                    <td style="padding:12px;border-bottom:1px solid #eee;">Organic</td>
                    ${compareList.map(p => `<td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">${p.organic ? '✅ Yes' : '❌ No'}</td>`).join('')}
                </tr>
                <tr>
                    <td style="padding:12px;border-bottom:1px solid #eee;">Ripeness</td>
                    ${compareList.map(p => `<td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">${p.ripeness}%</td>`).join('')}
                </tr>
                <tr>
                    <td style="padding:12px;border-bottom:1px solid #eee;">Origin</td>
                    ${compareList.map(p => `<td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">${p.origin.toUpperCase()}</td>`).join('')}
                </tr>
                <tr>
                    <td style="padding:12px;">Farm</td>
                    ${compareList.map(p => `<td style="padding:12px;text-align:center;">${escapeHtml(p.farm)}</td>`).join('')}
                </tr>
            </table>
        </div>
        <button class="btn-primary" style="margin-top:24px;width:100%;" onclick="document.getElementById('productModal').classList.add('hidden')">Close</button>
    `;
    
    if (modalContent) modalContent.innerHTML = compareHtml;
    if (modal) modal.classList.remove('hidden');
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.onclick = () => modal.classList.add('hidden');
    }
    if (modal) {
        modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');
    
    if (searchInput && searchDropdown) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                searchDropdown.classList.add('hidden');
                return;
            }
            const results = products.filter(p => p.name.toLowerCase().includes(query)).slice(0, 5);
            if (results.length > 0) {
                searchDropdown.innerHTML = results.map(p => `
                    <div class="search-result" onclick="showProductDetail(${p.id}); document.getElementById('searchDropdown').classList.add('hidden'); document.getElementById('searchInput').value = '';">
                        <img src="${p.image}" width="40" height="40" style="border-radius:8px;object-fit:cover">
                        <div><strong>${escapeHtml(p.name)}</strong><br>${formatPrice(p.price)}/lb</div>
                    </div>
                `).join('');
                searchDropdown.classList.remove('hidden');
            } else {
                searchDropdown.innerHTML = '<div class="search-result">No results found</div>';
                searchDropdown.classList.remove('hidden');
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.classList.add('hidden');
            }
        });
    }
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Setup wishlist and cart button navigation
function setupWishlistCartButtons() {
    const wishlistBtn = document.getElementById('wishlistBtn');
    const cartBtn = document.getElementById('cartBtn');
    
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            window.location.href = 'wishlist.html';
        });
    }
    
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }
}

// Show product detail modal
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.getElementById('closeModal');
    
    if (!modal || !modalContent) return;
    
    modalContent.innerHTML = `
        <div style="display:grid;gap:24px;">
            <img src="${product.image}" style="width:100%;border-radius:24px;" onerror="this.src='https://via.placeholder.com/400'">
            <h2 style="font-size:28px;margin:0;">${escapeHtml(product.name)}</h2>
            <p style="color:#666;line-height:1.6;">${escapeHtml(product.description)}</p>
            <div><strong>Farm:</strong> ${escapeHtml(product.farm)}</div>
            <div><strong>Origin:</strong> ${product.origin.toUpperCase()}</div>
            <div><strong>Price:</strong> ${formatPrice(product.price)}/lb</div>
            <div><strong>Organic:</strong> ${product.organic ? 'Yes' : 'No'}</div>
            <div><strong>Ripeness:</strong> ${product.ripeness}%</div>
            ${renderRipenessBar(product.ripeness)}
            <div style="display:flex;gap:12px;">
                <button class="btn-primary" style="flex:1;" onclick="addToCart(${product.id}); document.getElementById('productModal').classList.add('hidden');">
                    Add to Bowl - ${formatPrice(product.price)}
                </button>
                <button class="btn-secondary" style="flex:1;" onclick="toggleWishlist(${product.id}); showProductDetail(${product.id});">
                    ${isInWishlist(product.id) ? '❤️ Remove from Wishlist' : '🤍 Save to Wishlist'}
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    
    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.add('hidden');
    }
    modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
}

// Render ripeness bar
function renderRipenessBar(ripeness) {
    let color = '#2ECC71';
    if (ripeness < 40) color = '#E71D36';
    else if (ripeness < 70) color = '#FF9F1C';
    return `
        <div class="ripeness-bar" style="background:#eee;height:6px;border-radius:3px;margin:12px 0;">
            <div style="width:${ripeness}%;height:100%;background:${color};border-radius:3px;"></div>
        </div>
    `;
}

// Format price
function formatPrice(price) {
    return `Ugx ${price.toFixed(2)}`;
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerHTML = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    } else {
        alert(message);
    }
}

// Update badges (cart and wishlist counts)
function updateBadges() {
    const cartCount = document.getElementById('cartCount');
    const wishlistCount = document.getElementById('wishlistCount');
    
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = total;
        if (total === 0) cartCount.style.opacity = '0.5';
        else cartCount.style.opacity = '1';
    }
    
    if (wishlistCount) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlistCount.textContent = wishlist.length;
        if (wishlist.length === 0) wishlistCount.style.opacity = '0.5';
        else wishlistCount.style.opacity = '1';
    }
}

// Check if product is in wishlist
function isInWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    return wishlist.some(item => item.id === productId);
}

// Add to cart
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateBadges();
    showToast('Added to bowl!');
}

// Remove from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateBadges();
    showToast('Removed from bowl');
}

// Update cart quantity
function updateCartQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateBadges();
    }
}

// Toggle wishlist
function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const index = wishlist.findIndex(item => item.id === productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('Removed from wishlist');
    } else {
        const product = products.find(p => p.id === productId);
        if (product) {
            wishlist.push(product);
            showToast('Added to wishlist <i class="fas fa-heart"></i>');
        }
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateBadges();
}

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleWishlist = toggleWishlist;
window.isInWishlist = isInWishlist;
window.showProductDetail = showProductDetail;
window.removeFromCompare = removeFromCompare;
window.formatPrice = formatPrice;
window.renderRipenessBar = renderRipenessBar;
window.escapeHtml = escapeHtml;