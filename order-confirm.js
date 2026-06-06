document.addEventListener('DOMContentLoaded', () => {

  // Read the order saved by checkout.js
  const raw = localStorage.getItem('kathyOrderDetails');

  if (!raw) {
    window.location.href = 'index.html';
    return;
  }

  const order = JSON.parse(raw);

  // Order ID
  document.getElementById('kathy-order-id').textContent = order.orderID;

  // Customer
  document.getElementById('kathy-customer-name').textContent    = order.customer.name;
  document.getElementById('kathy-customer-email').textContent   = order.customer.email;
  document.getElementById('kathy-customer-phone').textContent   = order.customer.phone;
  document.getElementById('kathy-customer-address').textContent = order.customer.address;
  document.getElementById('kathy-payment-method').textContent   = order.paymentMethod;
  document.getElementById('kathy-delivery-method').textContent  = order.deliveryMethod;

  // Totals
  document.getElementById('kathy-order-subtotal').textContent = parseFloat(order.subtotal || order.total).toFixed(2);
  document.getElementById('kathy-order-total').textContent    = parseFloat(order.total).toFixed(2);

  const deliveryEl = document.getElementById('kathy-delivery-fee');
  if (deliveryEl) {
    deliveryEl.textContent = order.deliveryFee === 0 ? 'Free' : 'GHC ' + parseFloat(order.deliveryFee).toFixed(2);
  }

  // Items
  const list = document.getElementById('kathy-order-items');
  list.innerHTML = '';

  order.items.forEach(item => {
    const qty   = item.quantity || 1;
    const price = parseFloat(item.price || 0);
    const li    = document.createElement('li');
    li.className = 'confirm-item-row';
    li.innerHTML = `
      <div class="confirm-item-info">
        <img src="${item.image}" alt="${item.name}" class="confirm-item-img" onerror="this.style.display='none'">
        <div>
          <p class="confirm-item-name">${item.name}</p>
          <p class="confirm-item-qty">Qty: ${qty} &times; GHC ${price.toFixed(2)}</p>
        </div>
      </div>
      <span class="confirm-item-price">GHC ${(price * qty).toFixed(2)}</span>
    `;
    list.appendChild(li);
  });

  // Hamburger nav
  const hamburger = document.getElementById('hamburger');
  const siteNav   = document.getElementById('siteNav');
  if (hamburger && siteNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      siteNav.classList.toggle('open');
    });
  }

});