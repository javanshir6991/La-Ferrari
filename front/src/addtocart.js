// Cart logic
let cart = [];
// LocalStorage-dan səbəti oxu
try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
} catch (e) {
    cart = [];
}

function addToCart(product) {
    // Əgər məhsul artıq səbətdə varsa, sayını artır
    const idx = cart.findIndex(item => item.id === product.id);
    if (idx > -1) {
        cart[idx].count += 1;
    } else {
        cart.push({ ...product, count: 1 });
    }
    renderCart();
    // LocalStorage-a yaz
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) { }
    // Animasiya ilə bildiriş göstər
    showCartNotification();
}

function showCartNotification() {
    const notif = document.getElementById('cart-notification');
    if (!notif) return;
    notif.style.opacity = '1';
    notif.style.transform = 'translate(-50%, 0) scale(1.05)';
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translate(-50%, -20px) scale(1)';
    }, 1500);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) { }
    renderCart();
}

function renderCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    if (!cartItems || !cartSidebar) return;
    cartItems.innerHTML = '';
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        return;
    }
    cartEmpty.style.display = 'none';
    // LocalStorage-a yaz (render zamanı da sync olsun)
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) { }
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-4 bg-neutral-800 rounded-lg p-3';
        div.innerHTML = `
            <img src="${item.image}" class="w-16 h-16 object-cover rounded" alt="${item.title}">
            <div class="flex-1">
                <div class="font-bold text-lg">${item.title}</div>
                <div class="text-yellow-400">${item.price}</div>
                <div class="flex items-center gap-2 mt-2">
                    <button class="cart-qty-btn bg-neutral-700 text-black font-bold hover:bg-neutral-600 duration-500 px-2 rounded" data-id="${item.id}" data-action="decrease">-</button>
                    <span class="text-gray-400 font-bold mx-2">${item.count}</span>
                    <button class="cart-qty-btn bg-neutral-700 text-black font-bold hover:bg-neutral-600 duration-500 px-2 rounded" data-id="${item.id}" data-action="increase">+</button>
                </div>
            </div>
            <button class="remove-cart-btn text-red-400 text-xl" data-id="${item.id}"><i class="ri-delete-bin-line"></i></button>
        `;
        cartItems.appendChild(div);
    });
    // Quantity artır/azalt eventləri
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = Number(this.getAttribute('data-id'));
            const action = this.getAttribute('data-action');
            const idx = cart.findIndex(item => item.id === id);
            if (idx > -1) {
                if (action === 'increase') {
                    cart[idx].count += 1;
                } else if (action === 'decrease' && cart[idx].count > 1) {
                    cart[idx].count -= 1;
                }
                try {
                    localStorage.setItem('cart', JSON.stringify(cart));
                } catch (e) { }
                renderCart();
            }
        });
    });
    // Remove button event
    document.querySelectorAll('.remove-cart-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = Number(this.getAttribute('data-id'));
            removeFromCart(id);
        });
    });
}

// Cart sidebar açılma/bağlanma
document.addEventListener('DOMContentLoaded', () => {
    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartClose = document.getElementById('cart-close');
    // Refresh olanda səbəti render et
    renderCart();
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
});

// Productlara Add to Cart event
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('add-to-cart-btn')) {
        e.stopPropagation(); // detail pageyə atmaması üçün
        const card = e.target.closest('.fade-in');
        if (!card) return;
        const id = Number(e.target.getAttribute('data-id'));
        const title = card.querySelector('h3')?.textContent || '';
        const price = card.querySelector('span.text-yellow-400')?.textContent || '';
        const image = card.querySelector('img')?.src || '';
        addToCart({ id, title, price, image });
    }
});
