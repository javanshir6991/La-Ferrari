// Cart integration for detail page
// Ensure addtocart.js is loaded in shopDetail.html

document.addEventListener('DOMContentLoaded', () => {
    // Cart sidebar açılma/bağlanma
    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartClose = document.getElementById('cart-close');
    if (cartToggle && cartSidebar) {
        cartToggle.addEventListener('click', () => {
            cartSidebar.style.transform = 'translateX(0)';
        });
    }
    if (cartClose && cartSidebar) {
        cartClose.addEventListener('click', () => {
            cartSidebar.style.transform = 'translateX(100%)';
        });
    }
    // Refresh olanda səbəti render et
    if (typeof renderCart === 'function') {
        renderCart();
    }
});
