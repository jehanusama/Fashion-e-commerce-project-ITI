document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkout-form');

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const newOrder = {
                orderId: '#' + Math.floor(Math.random() * 100000),
                customer: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
                items: cartItems,
                total: subtotal, // This should be calculated with shipping, etc.
                status: 'Processing',
                date: new Date().toLocaleDateString(),
                shippingAddress: {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    phone: document.getElementById('phone').value,
                    email: document.getElementById('email').value,
                    address: document.getElementById('address').value,
                    country: document.getElementById('country').value,
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value,
                    zipCode: document.getElementById('zipCode').value,
                }
            };

            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(newOrder);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Clear the cart after placing order
            localStorage.removeItem('cart');

            console.log('Order placed and saved:', newOrder);
            window.location.href = 'complete-order.html';
        });
    }
});