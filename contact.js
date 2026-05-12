// js/contact.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Message sent! We\'ll reply within 2 hours <i class="fas fa-envelope"></i>');
            form.reset();
        });
    }
    updateBadges();
});