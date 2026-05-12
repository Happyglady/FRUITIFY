// js/home.js
document.addEventListener('DOMContentLoaded', () => {
    // Animated counters
    animateCounter('ordersToday', 1247);
    animateCounter('freshnessScore', 98.7, true);
    animateCounter('farmCount', 47);
    
    // Load seasonal carousel
    loadSeasonalCarousel();
    
    // Mood filters
    document.querySelectorAll('.mood-card').forEach(card => {
        card.addEventListener('click', () => {
            const mood = card.dataset.mood;
            localStorage.setItem('selectedMood', mood);
            window.location.href = 'shop.html';
        });
    });
    
    // Newsletter
    document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Subscribed! Check your email for 15% off <i class="fas fa-star"></i>');
        e.target.reset();
    });
    
    // Search
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
            if (results.length) {
                searchDropdown.innerHTML = results.map(p => `
                    <div class="search-result" onclick="window.location.href='shop.html?product=${p.id}'">
                        <img src="${p.image}" width="40" height="40" style="border-radius:8px;object-fit:cover">
                        <div><strong>${p.name}</strong><br>${formatPrice(p.price)}</div>
                    </div>
                `).join('');
                searchDropdown.classList.remove('hidden');
            } else {
                searchDropdown.innerHTML = '<div class="search-result">No results</div>';
                searchDropdown.classList.remove('hidden');
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.classList.add('hidden');
            }
        });
    }
});

function animateCounter(id, target, isPercent = false) {
    const element = document.getElementById(id);
    if (!element) return;
    let current = 0;
    const increment = target / 50;
    const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = isPercent ? target + '%' : Math.floor(target).toLocaleString();
            clearInterval(interval);
        } else {
            element.textContent = isPercent ? Math.floor(current) + '%' : Math.floor(current).toLocaleString();
        }
    }, 30);
}

function loadSeasonalCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    
    if (!track) return;
    
    const seasonal = products.slice(0, 6);
    track.innerHTML = seasonal.map(p => `
        <div class="carousel-item" onclick="window.location.href='shop.html?product=${p.id}'">
            <img src="${p.image}" alt="${p.name}">
            <div class="carousel-item-content">
                <span style="background:#E71D36;color:white;padding:4px 12px;border-radius:50px;font-size:12px">Limited Time</span>
                <h3 style="margin:12px0 4px">${p.name}</h3>
                <p style="font-size:14px;color:#666">${p.farm}</p>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
                    <strong style="font-size:20px">${formatPrice(p.price)}</strong>
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${p.id})">Add to bowl</button>
                </div>
            </div>
        </div>
    `).join('');
    
    let scrollAmount = 0;
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            scrollAmount -= 324;
            if (scrollAmount < 0) scrollAmount = 0;
            track.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            scrollAmount += 324;
            if (scrollAmount > track.scrollWidth - track.clientWidth) scrollAmount = track.scrollWidth - track.clientWidth;
            track.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        });
    }
}