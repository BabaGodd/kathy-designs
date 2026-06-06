/* =============================================
   WISHLIST.JS — Kathy Designs
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- DOM refs ---- */
  const wishlistGrid    = document.getElementById('wishlistGrid');
  const wishlistEmpty   = document.getElementById('wishlistEmpty');
  const wishlistFooter  = document.getElementById('wishlistFooter');
  const wishlistCount   = document.getElementById('wishlistCount');
  const clearBtn        = document.getElementById('clearWishlistBtn');
  const addAllBtn       = document.getElementById('addAllToCartBtn');

  /* ---- Hamburger ---- */
  const hamburger = document.getElementById('hamburger');
  const siteNav   = document.getElementById('siteNav');
  if (hamburger && siteNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      siteNav.classList.toggle('open');
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

  /* ---- Load wishlist ---- */
  function getWishlist() {
    return JSON.parse(localStorage.getItem('kathyWishlist')) || [];
  }

  function saveWishlist(list) {
    localStorage.setItem('kathyWishlist', JSON.stringify(list));
  }

  /* ---- Add to cart ---- */
  function addToCart(id, name, price, image) {
    let cart = JSON.parse(localStorage.getItem('kathyCart')) || { items: [], total: 0 };
    const existing = cart.items.find(i => i.id === id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.items.push({ id, name, price: parseFloat(price), image, quantity: 1 });
    }
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    localStorage.setItem('kathyCart', JSON.stringify(cart));

    // Update cart badge
    const badge = document.getElementById('cart-count');
    if (badge) {
      const total = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      badge.textContent = total;
    }
  }

  /* ---- Render wishlist ---- */
  function renderWishlist() {
    const wishlist = getWishlist();
    wishlistGrid.innerHTML = '';

    wishlistCount.textContent = wishlist.length;

    if (wishlist.length === 0) {
      wishlistEmpty.style.display  = 'block';
      wishlistFooter.style.display = 'none';
      clearBtn.style.display       = 'none';
      return;
    }

    wishlistEmpty.style.display  = 'none';
    wishlistFooter.style.display = 'flex';
    clearBtn.style.display       = 'flex';

    wishlist.forEach(item => {
      const card = document.createElement('div');
      card.className = 'wishlist-card';
      card.innerHTML = `
        <div class="wishlist-card-img-wrap">
          <img src="${item.image}" alt="${item.name}"
               onerror="this.src='productImages/placeholder.png'">
          <button class="wishlist-remove-btn" data-id="${item.id}" aria-label="Remove">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="wishlist-card-info">
          <h3 class="wishlist-card-name">${item.name}</h3>
          <p class="wishlist-card-price">GHC ${parseFloat(item.price).toFixed(2)}</p>
          <button class="wishlist-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-image="${item.image}">
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
      `;
      wishlistGrid.appendChild(card);
    });

    /* ---- Remove buttons ---- */
    wishlistGrid.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        let wishlist = getWishlist();
        const item   = wishlist.find(i => i.id === id);
        wishlist     = wishlist.filter(i => i.id !== id);
        saveWishlist(wishlist);
        renderWishlist();
        showToast(`${item?.name || 'Item'} removed from wishlist`);
      });
    });

    /* ---- Add to cart buttons ---- */
    wishlistGrid.querySelectorAll('.wishlist-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price, btn.dataset.image);
        btn.innerHTML = '<i class="fas fa-check"></i> Added!';
        btn.style.background = '#4caf50';
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-shopping-bag"></i> Add to Cart';
          btn.style.background = '';
        }, 1500);
        showToast(`${btn.dataset.name} added to cart ✓`);
      });
    });
  }

  /* ---- Clear all ---- */
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Clear your entire wishlist?')) return;
      saveWishlist([]);
      renderWishlist();
      showToast('Wishlist cleared.');
    });
  }

  /* ---- Add all to cart ---- */
  if (addAllBtn) {
    addAllBtn.addEventListener('click', () => {
      const wishlist = getWishlist();
      wishlist.forEach(item => {
        addToCart(item.id, item.name, item.price, item.image);
      });
      showToast(`${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} added to cart! 🛍️`);

      addAllBtn.innerHTML = '<i class="fas fa-check"></i> All Added!';
      addAllBtn.style.background = '#4caf50';
      setTimeout(() => {
        addAllBtn.innerHTML = '<i class="fas fa-shopping-bag"></i> Add All to Cart';
        addAllBtn.style.background = '';
      }, 2000);
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

  /* ---- Init ---- */
  renderWishlist();

});