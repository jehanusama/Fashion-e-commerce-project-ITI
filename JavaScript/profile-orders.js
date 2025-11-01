(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const ordersRaw = localStorage.getItem('orders');
    let orders = [];
    try {
      orders = ordersRaw ? JSON.parse(ordersRaw) : [];
      if (!Array.isArray(orders)) orders = [];
    } catch (e) {
      console.warn('Could not parse orders from localStorage', e);
      orders = [];
    }

    const orderContainer = document.getElementById('order-history-container');

    // If the page doesn't have the container, bail out quietly
    if (!orderContainer) return;

    orderContainer.innerHTML = '';

    if (orders.length === 0) {
      orderContainer.innerHTML = `
        <div class="text-center text-muted py-4">
          <i class="bi bi-bag-x fs-1 d-block mb-2"></i>
          <p>You have no orders yet.</p>
        </div>
      `;
      return;
    }

    orders.forEach(order => {
      // defensive normalization
      const items = Array.isArray(order.items) ? order.items : [];
      const itemsCount = items.length;

      // normalize total to a number (fallback 0)
      let total = 0;
      if (order && typeof order.total !== 'undefined' && order.total !== null && order.total !== '') {
        // try to coerce strings to number safely
        const n = Number(order.total);
        total = Number.isFinite(n) ? n : 0;
      }

      const orderElement = document.createElement('div');
      orderElement.className = 'order-item d-flex justify-content-between align-items-center p-3 border rounded mb-3';
      orderElement.innerHTML = `
        <div class="d-flex align-items-center gap-3">
          <div class="order-icon bg-light p-2 rounded-circle">
            <i class="bi bi-box-seam fs-4"></i>
          </div>
          <div>
            <div class="fw-semibold">Order #${order.orderId || '(unknown)'}</div>
            <small class="text-muted">${order.date || '(no date)'} • ${itemsCount} item${itemsCount !== 1 ? 's' : ''}</small>
          </div>
        </div>
        <div class="text-end">
          <div class="fw-bold text-success">$${(total).toFixed(2)}</div>
          <button class="btn btn-sm btn-outline-dark mt-1 view-order-btn" data-id="${order.orderId || ''}">
            <i class="bi bi-eye"></i> View
          </button>
        </div>
      `;
      orderContainer.appendChild(orderElement);
    });

    // handle "View" button clicks
    document.querySelectorAll('.view-order-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.dataset.id;
        // find by loose equality in case types differ
        const order = orders.find(o => String(o.orderId) === String(id));
        if (order) {
          try {
            localStorage.setItem('selected_order', JSON.stringify(order));
          } catch (e) {
            console.warn('Could not save selected_order to localStorage', e);
          }
          window.location.href = 'order-details.html';
        } else {
          // fallback: show an alert or do nothing
          if (window.Swal) {
            Swal.fire({ icon: 'error', title: 'Order not found', text: 'Could not find order details.' });
          } else {
            alert('Order not found.');
          }
        }
      });
    });
  });
})();
