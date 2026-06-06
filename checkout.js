document.addEventListener('DOMContentLoaded', () => {

  const DELIVERY_FEE = 20;
  const savedCart    = localStorage.getItem('kathyCart');
  const cartData     = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };

  const checkoutSummary  = document.getElementById('checkout-summary');
  const checkoutTotal    = document.getElementById('checkout-total');
  const checkoutSubtotal = document.getElementById('checkout-subtotal');
  const deliveryDisplay  = document.getElementById('checkout-delivery-display');
  const checkoutForm     = document.getElementById('kathy-checkout-form');
  const deliverySelect   = document.getElementById('delivery');
  const paymentSelect    = document.getElementById('payment');
  const mmNumberGroup    = document.getElementById('mmNumberGroup');
  const mmNumber         = document.getElementById('mmNumber');
  const submitBtn        = document.getElementById('submitBtn');

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const siteNav   = document.getElementById('siteNav');
  if (hamburger && siteNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      siteNav.classList.toggle('open');
    });
  }

  // Toast
  function showToast(message) {
    const note = document.getElementById('notification');
    if (!note) return;
    note.textContent = message;
    note.classList.add('show');
    setTimeout(() => note.classList.remove('show'), 3000);
  }

  // Empty cart
  if (!cartData.items || cartData.items.length === 0) {
    if (checkoutSummary) {
      checkoutSummary.innerHTML = `
        <div style="text-align:center;padding:1.5rem 0;color:#aaa;">
          <i class="fas fa-shopping-bag" style="font-size:2rem;margin-bottom:0.5rem;display:block;"></i>
          <p>Your cart is empty.</p>
          <a href="index.html" style="color:#FF8C00;font-weight:600;">Continue Shopping</a>
        </div>`;
    }
    if (checkoutSubtotal) checkoutSubtotal.textContent = '0.00';
    if (checkoutTotal)    checkoutTotal.textContent    = '0.00';
    if (submitBtn)        submitBtn.disabled = true;
    return;
  }

  // Render items
  if (checkoutSummary) {
    checkoutSummary.innerHTML = '';
    cartData.items.forEach(item => {
      const itemSubtotal = parseFloat(item.price || 0) * parseInt(item.quantity || 1);
      const div = document.createElement('div');
      div.className = 'checkout-item-row';
      div.innerHTML = `
        <div class="checkout-item-info">
          <img src="${item.image}" alt="${item.name}" class="checkout-item-img" onerror="this.style.display='none'">
          <div>
            <p class="checkout-item-name">${item.name}</p>
            <p class="checkout-item-qty">Qty: ${item.quantity}</p>
          </div>
        </div>
        <span class="checkout-item-price">GHC ${itemSubtotal.toFixed(2)}</span>
      `;
      checkoutSummary.appendChild(div);
    });
  }

  // Live totals
  function updateTotals() {
    const subtotal = cartData.items.reduce((sum, i) => sum + parseFloat(i.price || 0) * parseInt(i.quantity || 1), 0);
    const isPickup = deliverySelect && deliverySelect.value === 'Pickup';
    const delivery = isPickup ? 0 : DELIVERY_FEE;
    const total    = subtotal + delivery;
    if (checkoutSubtotal) checkoutSubtotal.textContent = subtotal.toFixed(2);
    if (checkoutTotal)    checkoutTotal.textContent    = total.toFixed(2);
    if (deliveryDisplay)  deliveryDisplay.textContent  = isPickup ? 'Free' : `GHC ${delivery.toFixed(2)}`;
  }

  updateTotals();
  if (deliverySelect) deliverySelect.addEventListener('change', updateTotals);

  // Mobile Money toggle
  if (paymentSelect && mmNumberGroup) {
    paymentSelect.addEventListener('change', () => {
      if (paymentSelect.value === 'Mobile Money') {
        mmNumberGroup.style.display = 'block';
        if (mmNumber) mmNumber.required = true;
      } else {
        mmNumberGroup.style.display = 'none';
        if (mmNumber) { mmNumber.required = false; mmNumber.value = ''; }
      }
    });
  }

  // Validation
  function validateForm() {
    const fields = [
      { id: 'fullName', msg: 'Please enter your full name.' },
      { id: 'email',    msg: 'Please enter a valid email address.' },
      { id: 'phone',    msg: 'Please enter your phone number.' },
      { id: 'address',  msg: 'Please enter your delivery address.' },
      { id: 'delivery', msg: 'Please select a delivery method.' },
      { id: 'payment',  msg: 'Please select a payment method.' },
    ];
    for (const field of fields) {
      const el = document.getElementById(field.id);
      if (!el || !el.value.trim()) {
        showToast(field.msg);
        if (el) el.focus();
        return false;
      }
    }
    if (paymentSelect.value === 'Mobile Money') {
      const mm = document.getElementById('mmNumber');
      if (!mm || !mm.value.trim()) {
        showToast('Please enter your Mobile Money number.');
        return false;
      }
    }
    return true;
  }

  // Form submit
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!validateForm()) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing…';
      }

      const orderID     = 'KD-' + Math.floor(100000 + Math.random() * 900000);
      const isPickup    = document.getElementById('delivery').value === 'Pickup';
      const deliveryFee = isPickup ? 0 : DELIVERY_FEE;
      const subtotal    = cartData.items.reduce((sum, i) => sum + parseFloat(i.price || 0) * parseInt(i.quantity || 1), 0);
      const total       = subtotal + deliveryFee;

      const orderDetails = {
        orderID,
        customer: {
          name:    document.getElementById('fullName').value.trim(),
          email:   document.getElementById('email').value.trim(),
          phone:   document.getElementById('phone').value.trim(),
          address: document.getElementById('address').value.trim(),
        },
        items:          cartData.items,
        subtotal,
        deliveryFee,
        total,
        paymentMethod:  document.getElementById('payment').value,
        deliveryMethod: document.getElementById('delivery').value,
        mmNumber:       mmNumber ? mmNumber.value.trim() : '',
        notes:          document.getElementById('notes') ? document.getElementById('notes').value.trim() : '',
        date:           new Date().toISOString(),
        status:         'Pending'
      };

      // Save to localStorage first
      localStorage.setItem('kathyOrderDetails', JSON.stringify(orderDetails));
      let orders = JSON.parse(localStorage.getItem('kathyOrders')) || [];
      orders.push(orderDetails);
      localStorage.setItem('kathyOrders', JSON.stringify(orders));

      // Save to Supabase using helper from supabase.js
      const success = await saveOrderToSupabase(orderDetails);
      if (success) {
        console.log('Order saved to Supabase successfully!');
      }
      // Clear cart and redirect regardless
      localStorage.removeItem('kathyCart');
      window.location.href = 'order-confirm.html';
    });
  }

  // Newsletter
  const newsletterBtn   = document.getElementById('newsletterBtn');
  const newsletterEmail = document.getElementById('newsletterEmail');
  if (newsletterBtn && newsletterEmail) {
    newsletterBtn.addEventListener('click', () => {
      const email = newsletterEmail.value.trim();
      if (!email || !email.includes('@')) { showToast('Please enter a valid email.'); return; }
      newsletterEmail.value = '';
      showToast('Thanks for subscribing! 🎉');
    });
  }

});