// Load cart from localStorage
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        return;
    }

    cartItems.innerHTML = '';
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';

        const price = parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0; // '298.400 $' kimi format üçün
        const quantity = parseInt(item.count) || 1;

        itemDiv.innerHTML = `
            <div class="item-info" style="display:flex; align-items:center; gap:10px;">
                <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.title || 'Product'}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
                <div>
                    <h3>${item.title || 'Product'}</h3>
                    <p>Quantity: ${quantity}</p>
                </div>
            </div>
            <div class="item-price">$${(price * quantity).toFixed(2)}</div>
        `;
        cartItems.appendChild(itemDiv);
    });

    calculateTotals(cart);
}

function calculateTotals(cart) {
    const subtotal = cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0;
        const quantity = parseInt(item.count) || 1;
        return sum + (price * quantity);
    }, 0);
    const shipping = subtotal > 0 ? 15.00 : 0;
    const tax = subtotal * 0.10;
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}


// Format card number with spaces
document.getElementById('cardNumber').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
});

// Format expiry date
document.getElementById('expiryDate').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

// Only allow numbers in CVV
document.getElementById('cvv').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '');
});

function completeOrder() {
    // Validate form
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiryDate = document.getElementById('expiryDate').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    if (!firstName || !lastName || !email || !phone || !address || !city || !zipCode || !cardNumber || !expiryDate || !cvv) {
        alert('Please fill in all required fields!');
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const notes = document.getElementById('notes').value.trim();
    const total = document.getElementById('total').textContent;

    // Create order object
    const order = {
        orderNumber: 'ORD-' + Date.now(),
        date: new Date().toLocaleDateString(),
        customer: {
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            zipCode
        },
        payment: {
            cardNumber: '**** **** **** ' + cardNumber.slice(-4),
            expiryDate
        },
        items: cart,
        total,
        notes
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem('cart');

    // Show success message
    showSuccessMessage(order);
}

function showSuccessMessage(order) {
    const orderDetails = document.getElementById('orderDetails');
    orderDetails.innerHTML = `
                <h3>Order Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Order Number:</span>
                    <span>${order.orderNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Customer:</span>
                    <span>${order.customer.firstName} ${order.customer.lastName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span>${order.customer.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Shipping Address:</span>
                    <span>${order.customer.address}, ${order.customer.city} ${order.customer.zipCode}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total:</span>
                    <span>${order.total}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Items:</span>
                    <span>${order.items.length}</span>
                </div>
            `;

    document.getElementById('overlay').classList.add('show');
    document.getElementById('successMessage').classList.add('show');
}

function closeSuccess() {
    document.getElementById('overlay').classList.remove('show');
    document.getElementById('successMessage').classList.remove('show');

    // Reset form and reload cart
    document.querySelectorAll('input, textarea').forEach(input => input.value = '');
    loadCart();
}

// Load cart on page load
loadCart();