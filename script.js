/* =============================================
   SCRIPT.JS — Kathy Designs Store
   Handles:
   - Mobile nav toggle
   - Featured carousel (auto-scroll + manual arrows)
   - Quick view panel
   - Wishlist
   - Product sort
   - Search bar with live results
   - Back to top button
   - Newsletter subscribe
   - Size selector in quick view
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ================================================
     MOBILE NAV
  ================================================ */
  const hamburger = document.getElementById('hamburger');
  const siteNav   = document.getElementById('siteNav');

  if (hamburger && siteNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      siteNav.classList.toggle('open');
    });

    siteNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        siteNav.classList.remove('open');
      });
    });
  }

  /* ================================================
     FEATURED CAROUSEL — Auto-scroll + manual arrows
  ================================================ */
  const track    = document.getElementById('featuredTrack');
  const prevBtn  = document.querySelector('.carousel-prev');
  const nextBtn  = document.querySelector('.carousel-next');
  const viewport = document.querySelector('.carousel-viewport');

  if (track && prevBtn && nextBtn) {
    let currentIndex    = 0;
    let autoScrollTimer = null;
    const AUTO_INTERVAL = 3000; // slide every 3 seconds

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w < 480)  return 1;
      if (w < 768)  return 2;
      if (w < 1024) return 3;
      return 4;
    }

    function getCardWidth() {
      const card = track.querySelector('.feat-card');
      if (!card) return 0;
      const gap = parseFloat(window.getComputedStyle(track).gap) || 19;
      return card.offsetWidth + gap;
    }

    function getMaxIndex() {
      return Math.max(0, track.querySelectorAll('.feat-card').length - getVisibleCount());
    }

    function goToIndex(index) {
      const maxIndex = getMaxIndex();
      // Loop: past the end → back to start, before start → go to end
      if (index > maxIndex) index = 0;
      if (index < 0)        index = maxIndex;
      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
      prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
      nextBtn.style.opacity = currentIndex >= maxIndex ? '0.4' : '1';
    }

    function startAutoScroll() {
      stopAutoScroll();
      autoScrollTimer = setInterval(() => goToIndex(currentIndex + 1), AUTO_INTERVAL);
    }

    function stopAutoScroll() {
      if (autoScrollTimer) {
        clearInterval(autoScrollTimer);
        autoScrollTimer = null;
      }
    }

    // Manual arrows — pause then resume after 2 intervals
    prevBtn.addEventListener('click', () => {
      goToIndex(currentIndex - 1);
      stopAutoScroll();
      setTimeout(startAutoScroll, AUTO_INTERVAL * 2);
    });

    nextBtn.addEventListener('click', () => {
      goToIndex(currentIndex + 1);
      stopAutoScroll();
      setTimeout(startAutoScroll, AUTO_INTERVAL * 2);
    });

    // Pause on hover, resume on leave
    if (viewport) {
      viewport.addEventListener('mouseenter', stopAutoScroll);
      viewport.addEventListener('mouseleave', startAutoScroll);
    }

    // Recalculate on resize
    window.addEventListener('resize', () => goToIndex(currentIndex));

    // Start
    goToIndex(0);
    startAutoScroll();
  }

  /* ================================================
     QUICK VIEW PANEL
  ================================================ */
  const overlay      = document.querySelector('.qe-quickview-overlay');
  const panel        = document.querySelector('.qe-quickview-panel');
  const closeBtn     = document.querySelector('.qe-close-btn');
  const panelCartBtn = panel ? panel.querySelector('.qe-add-cart-btn') : null;

  function openQuickView(card) {
    if (!panel || !overlay) return;

    const img     = card.querySelector('.shop-product-image');
    const name    = card.querySelector('.shop-product-name');
    const price   = card.querySelector('.shop-price');
    const cartBtn = card.querySelector('.shop-add-to-cart');

    if (img)   panel.querySelector('.qe-quickview-image').src         = img.src;
    if (name)  panel.querySelector('.qe-quickview-title').textContent  = name.textContent;
    if (price) panel.querySelector('.qe-quickview-price').textContent  = price.textContent;

    if (panelCartBtn && cartBtn) {
      panelCartBtn.dataset.id    = cartBtn.dataset.id    || '';
      panelCartBtn.dataset.name  = cartBtn.dataset.name  || (name ? name.textContent : '');
      panelCartBtn.dataset.price = cartBtn.dataset.price || '';
      panelCartBtn.dataset.image = cartBtn.dataset.image || (img ? img.src : '');
    }

    panel.querySelectorAll('.qe-sizes span').forEach(s => s.classList.remove('selected'));
    panel.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickView() {
    if (!panel || !overlay) return;
    panel.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.qe-quickview-btn');
    if (btn) {
      const card = btn.closest('.shop-product-card');
      if (card) openQuickView(card);
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeQuickView);
  if (overlay)  overlay.addEventListener('click', closeQuickView);

  if (panel) {
    panel.querySelectorAll('.qe-sizes span').forEach(span => {
      span.addEventListener('click', () => {
        panel.querySelectorAll('.qe-sizes span').forEach(s => s.classList.remove('selected'));
        span.classList.add('selected');
      });
    });
  }

  /* ================================================
     WISHLIST
  ================================================ */
  function getWishlist() {
    return JSON.parse(localStorage.getItem('kathyWishlist')) || [];
  }

  function saveWishlist(list) {
    localStorage.setItem('kathyWishlist', JSON.stringify(list));
  }

  function restoreWishlistState() {
    const wishlist = getWishlist();
    document.querySelectorAll('.qe-wishlist-btn').forEach(btn => {
      if (wishlist.some(item => item.id === btn.dataset.id)) {
        btn.classList.add('active');
        const icon = btn.querySelector('i');
        if (icon) icon.style.color = '#FF8C00';
      }
    });
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.qe-wishlist-btn');
    if (!btn) return;
    const card = btn.closest('.shop-product-card');
    if (!card) return;

    const product = {
      id:    btn.dataset.id,
      name:  card.querySelector('.shop-product-name')?.textContent || '',
      price: card.querySelector('.shop-price')?.textContent?.replace('GHC ', '') || '',
      image: card.querySelector('.shop-product-image')?.src || ''
    };

    let wishlist = getWishlist();
    const exists = wishlist.some(item => item.id === product.id);
    const icon   = btn.querySelector('i');

    if (exists) {
      wishlist = wishlist.filter(item => item.id !== product.id);
      btn.classList.remove('active');
      if (icon) icon.style.color = '';
      showToast(`${product.name} removed from wishlist`);
    } else {
      wishlist.push(product);
      btn.classList.add('active');
      if (icon) icon.style.color = '#FF8C00';
      showToast(`${product.name} added to wishlist ❤️`);
    }

    saveWishlist(wishlist);
  });

  restoreWishlistState();

  /* ================================================
     PRODUCT SORT
  ================================================ */
  const sortSelect  = document.getElementById('sortSelect');
  const productGrid = document.getElementById('productGrid');

  if (sortSelect && productGrid) {
    sortSelect.addEventListener('change', () => {
      const cards = Array.from(productGrid.querySelectorAll('.shop-product-card'));
      cards.sort((a, b) => {
        const priceA = parseFloat(a.dataset.price || 0);
        const priceB = parseFloat(b.dataset.price || 0);
        if (sortSelect.value === 'price-asc')  return priceA - priceB;
        if (sortSelect.value === 'price-desc') return priceB - priceA;
        return 0;
      });
      cards.forEach(card => productGrid.appendChild(card));
    });
  }

  /* ================================================
     LIVE SEARCH
  ================================================ */
  const searchInput   = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (searchInput && searchResults && productGrid) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = '';

      if (!query) {
        searchResults.classList.remove('open');
        return;
      }

      const matches = [];
      productGrid.querySelectorAll('.shop-product-card').forEach(card => {
        const name  = card.querySelector('.shop-product-name')?.textContent || '';
        const price = card.querySelector('.shop-price')?.textContent || '';
        const img   = card.querySelector('.shop-product-image')?.src || '';
        if (name.toLowerCase().includes(query)) matches.push({ name, price, img });
      });

      if (matches.length === 0) {
        searchResults.innerHTML = `<div class="search-no-results">No products found for "<strong>${query}</strong>"</div>`;
      } else {
        matches.slice(0, 6).forEach(item => {
          const div = document.createElement('div');
          div.className = 'search-result-item';
          div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div>
              <div class="search-result-name">${item.name}</div>
              <div class="search-result-price">${item.price}</div>
            </div>
          `;
          div.addEventListener('click', () => {
            searchInput.value = item.name;
            searchResults.classList.remove('open');
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
          });
          searchResults.appendChild(div);
        });
      }

      searchResults.classList.add('open');
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.search-wrap')) searchResults.classList.remove('open');
    });

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => searchInput.dispatchEvent(new Event('input')));
    }
  }

  /* ================================================
     BACK TO TOP
  ================================================ */
  const backToTop = document.getElementById('backToTop');

  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ================================================
     NEWSLETTER
  ================================================ */
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

  /* ================================================
     TOAST
  ================================================ */
  function showToast(message) {
    const note = document.getElementById('notification');
    if (!note) return;
    note.textContent = message;
    note.classList.add('show');
    setTimeout(() => note.classList.remove('show'), 2500);
  }

});

/* =============================================
   MOBILE SEARCH
   ============================================= */
(function() {
  // Add mobile search button to header actions
  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) return;

  // Create mobile search button
  const mobileSearchBtn = document.createElement('button');
  mobileSearchBtn.className = 'mobile-search-btn';
  mobileSearchBtn.setAttribute('aria-label', 'Search');
  mobileSearchBtn.innerHTML = '<i class="fas fa-search"></i>';

  // Insert before cart link
  const cartLink = headerActions.querySelector('.cart-link');
  if (cartLink) {
    headerActions.insertBefore(mobileSearchBtn, cartLink);
  } else {
    headerActions.prepend(mobileSearchBtn);
  }

  // Create mobile search overlay
  const overlay = document.createElement('div');
  overlay.className = 'mobile-search-overlay';
  overlay.innerHTML = `
    <input type="text" id="mobileSearchInput" placeholder="Search products…" autocomplete="off">
    <button class="mobile-search-close" id="mobileSearchClose">
      <i class="fas fa-times"></i>
    </button>
  `;
  document.body.appendChild(overlay);

  // Create mobile search results
  const mobileResults = document.createElement('div');
  mobileResults.className = 'mobile-search-results';
  mobileResults.id = 'mobileSearchResults';
  document.body.appendChild(mobileResults);

  const mobileInput = document.getElementById('mobileSearchInput');
  const mobileClose = document.getElementById('mobileSearchClose');

  // Open search overlay
  mobileSearchBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    setTimeout(() => mobileInput && mobileInput.focus(), 100);
  });

  // Close search overlay
  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      overlay.classList.remove('open');
      mobileResults.classList.remove('open');
      if (mobileInput) mobileInput.value = '';
    });
  }

  // Mobile search logic
  if (mobileInput) {
    mobileInput.addEventListener('input', () => {
      const query = mobileInput.value.trim().toLowerCase();
      mobileResults.innerHTML = '';

      if (!query || typeof KATHY_ALL_PRODUCTS === 'undefined') {
        mobileResults.classList.remove('open');
        return;
      }

      const matches = KATHY_ALL_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      ).slice(0, 6);

      if (matches.length === 0) {
        mobileResults.innerHTML = `<div class="search-no-results">No products found for "<strong>${query}</strong>"</div>`;
      } else {
        matches.forEach(item => {
          const div = document.createElement('div');
          div.className = 'search-result-item';
          div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src=''">
            <div>
              <div class="search-result-name">${item.name}</div>
              <div class="search-result-meta">
                <span class="search-result-price">GHC ${item.price.toFixed(2)}</span>
                <span class="search-result-cat">${item.category}</span>
              </div>
            </div>
            <i class="fas fa-arrow-right search-result-arrow"></i>
          `;
          div.addEventListener('click', () => {
            window.location.href = item.page + '#products';
          });
          mobileResults.appendChild(div);
        });
      }

      mobileResults.classList.add('open');
    });
  }
})();