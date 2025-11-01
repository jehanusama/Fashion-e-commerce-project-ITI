document.addEventListener('DOMContentLoaded', function () {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser) {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = `${loggedInUser.fname} ${loggedInUser.lname}`;
        }
    }

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const ordersTableBody = document.querySelector('#orders-table tbody');

    if (ordersTableBody) {
        orders.slice(0, 5).forEach(order => { // Display latest 5 orders
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.customer}</td>
                <td>${order.items.length} items</td>
                <td>$${order.total.toFixed(2)}</td>
                <td><span class="badge-processing">${order.status}</span></td>
                <td>${order.date}</td>
            `;
            ordersTableBody.appendChild(row);
        });
    }
});