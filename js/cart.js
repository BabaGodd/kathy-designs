/* =============================================
   JS/CART.JS — Kathy Designs
   Single source of truth for all cart logic.
   Handles:
   - Add to cart (all pages)
   - Update cart count in header
   - Display cart items on cart.html
   - Quantity increase / decrease
   - Remove item
   - Clear cart
   - Checkout redirect
   - Toast notifications
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Cart State ---- */
  let cart = JSON.parse(localStorage.getItem('kathyCart')) || { items: [], total: 0 };

  /* ---- DOM Refs ---- */
  const cartCountEl      = document.getElementById('cart-count');
  const cartItemsCon     = document.getElementById('kathy-cart-items');
  const cartTotalEl      = document.getElementById('kathy-cart-total');
  const clearCartBtn     = document.getElementById('kathy-clear-cart');
  const checkoutBtn      = document.getElementById('kathy-checkout-btn');

  /* ================================================
     UTILITIES
  ================================================ */

  function showToast(message) {
    const note = document.getElementById('notification');
    if (!note) return;
    note.textContent = message;
    note.classList.add('show');
    setTimeout(() => note.classList.remove('show'), 2500);
  }

  function saveCart() {
    localStorage.setItem('kathyCart', JSON.stringify({ items: cart.items, total: cart.total }));
    updateCartCount();
  }

  function recalcTotal() {
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  /* ================================================
     CART COUNT (header badge)
  ================================================ */
  function updateCartCount() {
    const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountEl) cartCountEl.textContent = total;
  }

  /* ================================================
     ADD TO CART
  ================================================ */
  function addToCart(id, name, price, image) {
    const existing = cart.items.find(i => i.id === id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.items.push({
        id,
        name,
        price: parseFloat(price),
        image,
        quantity: 1
      });
    }
    recalcTotal();
    saveCart();
    showToast(`✓ ${name} added to cart`);

    // Bump animation on cart icon
    if (cartCountEl) {
      cartCountEl.classList.remove('bump');
      void cartCountEl.offsetWidth; // reflow
      cartCountEl.classList.add('bump');
      setTimeout(() => cartCountEl.classList.remove('bump'), 300);
    }
  }

  // Bind all add-to-cart buttons (including quick view panel)
  document.addEventListener('click', e => {
    const btn = e.target.closest('.shop-add-to-cart');
    if (!btn) return;
    const { id, name, price, image } = btn.dataset;
    if (id && name && price) {
      addToCart(id, name, price, image || '');
    }
  });

  /* ================================================
     CART PAGE — Display Items
  ================================================ */
  function displayCartItems() {
    if (!cartItemsCon) return;

    cartItemsCon.innerHTML = '';

    if (cart.items.length === 0) {
      cartItemsCon.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;">
          <i class="fas fa-shopping-bag" style="font-size:3rem;color:#ddd;display:block;margin-bottom:1rem;"></i>
          <p class="kathy-empty">Your cart is empty.</p>
          <a href="index.html" style="display:inline-block;margin-top:1rem;padding:0.7rem 1.5rem;background:#FF8C00;color:white;border-radius:8px;font-weight:700;text-decoration:none;">Continue Shopping</a>
        </div>
      `;
      if (cartTotalEl) cartTotalEl.textContent = '0.00';
      return;
    }

    cart.items.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      const div = document.createElement('div');
      div.className = 'kathy-cart-item';
      div.innerHTML = `
        <img src="${item.image}" class="kathy-cart-img" alt="${item.name}" onerror="this.src='productImages/placeholder.png'">
        <div class="kathy-cart-info">
          <h3>${item.name}</h3>
          <p>Price: <strong>GHC ${item.price.toFixed(2)}</strong></p>
          <div class="kathy-cart-qty">
            <button class="kathy-qty-btn" data-index="${index}" data-action="decrease">−</button>
            <span style="font-weight:700;min-width:24px;text-align:center;">${item.quantity}</span>
            <button class="kathy-qty-btn" data-index="${index}" data-action="increase">+</button>
          </div>
          <p>Subtotal: <strong style="color:#FF8C00;">GHC ${subtotal.toFixed(2)}</strong></p>
          <button class="kathy-remove-btn" data-index="${index}">
            <i class="fas fa-trash-alt"></i> Remove
          </button>
        </div>
      `;
      cartItemsCon.appendChild(div);
    });

    if (cartTotalEl) cartTotalEl.textContent = cart.total.toFixed(2);
  }

  // Cart item interactions (quantity & remove)
  if (cartItemsCon) {
    cartItemsCon.addEventListener('click', e => {
      // Quantity buttons
      const qtyBtn = e.target.closest('.kathy-qty-btn');
      if (qtyBtn) {
        const index  = parseInt(qtyBtn.dataset.index);
        const action = qtyBtn.dataset.action;
        if (action === 'increase') {
          cart.items[index].quantity++;
        } else if (action === 'decrease') {
          cart.items[index].quantity--;
          if (cart.items[index].quantity < 1) cart.items.splice(index, 1);
        }
        recalcTotal();
        saveCart();
        displayCartItems();
        return;
      }

      // Remove button
      const removeBtn = e.target.closest('.kathy-remove-btn');
      if (removeBtn) {
        const index = parseInt(removeBtn.dataset.index);
        const name  = cart.items[index]?.name || 'Item';
        cart.items.splice(index, 1);
        recalcTotal();
        saveCart();
        displayCartItems();
        showToast(`${name} removed from cart`);
      }
    });
  }

  // Clear cart
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (!confirm('Clear your entire cart?')) return;
      cart = { items: [], total: 0 };
      saveCart();
      displayCartItems();
      showToast('Cart cleared.');
    });
  }

  // Checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.items.length === 0) {
        showToast('Your cart is empty!');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }

  /* ================================================
     INIT
  ================================================ */
  updateCartCount();

  // Only render cart items on cart page
  if (window.location.pathname.includes('cart.html')) {
    displayCartItems();
  }

});