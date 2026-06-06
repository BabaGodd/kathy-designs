/* =============================================
   CART-PAGE.JS — Kathy Designs
   Handles cart page specific interactions:
   - Live subtotal + delivery fee display
   - Promo code (demo)
   - Hamburger nav
   - Newsletter subscribe
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  const DELIVERY_FEE = 20;
  let promoApplied = false;

  /* ---- Hamburger ---- */
  const hamburger = document.getElementById('hamburger');
  const siteNav   = document.getElementById('siteNav');

  if (hamburger && siteNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      siteNav.classList.toggle('open');
    });
  }

  /* ---- Live totals ---- */
  function updateSummary() {
    const cart     = JSON.parse(localStorage.getItem('kathyCart')) || { items: [], total: 0 };
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const delivery = cart.items.length === 0 ? 0 : DELIVERY_FEE;
    const total    = subtotal + delivery;

    const subtotalEl  = document.getElementById('kathy-cart-subtotal');
    const totalEl     = document.getElementById('kathy-cart-total');
    const deliveryEl  = document.getElementById('cart-delivery-fee');

    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if (deliveryEl) deliveryEl.textContent = cart.items.length === 0 ? 'GHC 0.00' : `GHC ${delivery.toFixed(2)}`;
    if (totalEl)    totalEl.textContent    = total.toFixed(2);
  }

  // Run on load and watch for storage changes (when cart.js updates)
  updateSummary();
  window.addEventListener('storage', updateSummary);

  // Re-run after cart.js renders items (slight delay to let cart.js finish)
  setTimeout(updateSummary, 300);

  // Patch: intercept cart item clicks to refresh totals
  const cartItemsCon = document.getElementById('kathy-cart-items');
  if (cartItemsCon) {
    cartItemsCon.addEventListener('click', () => {
      setTimeout(updateSummary, 100);
    });
  }

  /* ---- Promo Code (demo) ---- */
  const promoBtn   = document.getElementById('promoBtn');
  const promoInput = document.getElementById('promoInput');

  const PROMO_CODES = {
    'KATHY10': 10,
    'GHANA20': 20,
    'WELCOME': 15
  };

  if (promoBtn && promoInput) {
    promoBtn.addEventListener('click', () => {
      if (promoApplied) {
        showToast('A promo code is already applied.');
        return;
      }

      const code = promoInput.value.trim().toUpperCase();
      if (!code) {
        showToast('Please enter a promo code.');
        return;
      }

      if (PROMO_CODES[code]) {
        const discount = PROMO_CODES[code];
        const cart     = JSON.parse(localStorage.getItem('kathyCart')) || { items: [], total: 0 };
        const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const delivery = cart.items.length === 0 ? 0 : DELIVERY_FEE;
        const discountAmt = (subtotal * discount / 100);
        const total    = Math.max(0, subtotal + delivery - discountAmt);

        const totalEl = document.getElementById('kathy-cart-total');
        if (totalEl) totalEl.textContent = total.toFixed(2);

        promoApplied = true;
        promoInput.disabled = true;
        promoBtn.textContent = '✓ Applied';
        promoBtn.style.background = '#4caf50';

        showToast(`Promo code applied! ${discount}% off 🎉`);
      } else {
        showToast('Invalid promo code. Try KATHY10, GHANA20 or WELCOME.');
      }
    });
  }

  /* ---- Newsletter ---- */
  const newsletterBtn   = document.getElementById('newsletterBtn');
  const newsletterEmail = document.getElementById('newsletterEmail');

  if (newsletterBtn && newsletterEmail) {
    newsletterBtn.addEventListener('click', () => {
      const email = newsletterEmail.value.trim();
      if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address.');
        return;
      }
      newsletterEmail.value = '';
      showToast('Thanks for subscribing! 🎉');
    });
  }

  /* ---- Toast ---- */
  function showToast(message) {
    const note = document.getElementById('notification');
    if (!note) return;
    note.textContent = message;
    note.classList.add('show');
    setTimeout(() => note.classList.remove('show'), 2500);
  }

});