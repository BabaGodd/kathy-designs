/* =============================================
   PRODUCTS.JS — Kathy Designs Admin
   Fixed: no blinking images, clean rendering

   NOTE: This file has been updated to use Supabase
   instead of localStorage for data persistence.
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- DOM refs ---- */
  const productGrid     = document.getElementById('productGrid');
  const searchInput     = document.getElementById('searchInput');
  const categoryFilter  = document.getElementById('categoryFilter');
  const addProductBtn   = document.getElementById('addProductBtn');
  const productModal    = document.getElementById('productModal');
  const productForm     = document.getElementById('productForm');
  const closeModalBtn   = document.getElementById('closeModalBtn');
  const cancelBtn       = document.getElementById('cancelBtn');
  const deleteModal     = document.getElementById('deleteModal');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn= document.getElementById('confirmDeleteBtn');
  const modalTitle      = document.getElementById('modalTitle');
  const toast           = document.getElementById('toast');
  const totalProducts   = document.getElementById('totalProducts');
  const exportBtn       = document.getElementById('exportBtn');

  let products    = []; // Will be loaded from Supabase
  let editIndex   = -1;
  let deleteIndex = -1;

  /* ---- Toast ---- */
  function showToast(message, type = 'success') {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => { toast.className = 'toast'; }, 3000);
  }

  /* ---- Save (No longer needed for localStorage) ---- */
  // The new save function will call Supabase directly.
  function saveProducts() {
    // This function is now deprecated in favor of direct Supabase calls.
    // For example: saveProductToSupabase(product)
    console.warn('saveProducts() is deprecated.');
  }

  /* ---- Render ---- */
  function renderProducts() {
    if (!productGrid) return;

    const search   = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : 'all';

    const filtered = products.filter(p => {
      const matchSearch   = !search || p.name.toLowerCase().includes(search) || (p.category||'').toLowerCase().includes(search);
      const matchCategory = category === 'all' || p.category === category;
      return matchSearch && matchCategory;
    });

    if (totalProducts) totalProducts.textContent = filtered.length;

    if (filtered.length === 0) {
      productGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:3rem;color:#aaa;">
          <i class="fas fa-box-open" style="font-size:2.5rem;margin-bottom:1rem;display:block;"></i>
          <p>No products found.</p>
        </div>`;
      return;
    }

    /* Build HTML in one go — avoids blinking */
    const html = filtered.map((p, i) => {
      const realIndex  = products.indexOf(p);
      const stock      = parseInt(p.stock || 0);
      const stockClass = stock === 0 ? 'out-of-stock' : stock <= 5 ? 'low-stock' : 'in-stock';
      const stockLabel = stock === 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock';

      return `
        <div class="product-card">
          <div class="product-card-img">
            <img src="${p.image || ''}"
                 alt="${p.name}"
                 loading="lazy"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div class="product-img-fallback" style="display:none;width:100%;height:100%;background:#f5f5f5;align-items:center;justify-content:center;flex-direction:column;gap:4px;">
              <i class="fas fa-image" style="font-size:1.5rem;color:#ddd;"></i>
              <span style="font-size:0.7rem;color:#ccc;">No Image</span>
            </div>
            <span class="stock-badge ${stockClass}">${stockLabel}</span>
          </div>
          <div class="product-card-body">
            <h3 title="${p.name}">${p.name}</h3>
            <p class="product-price">GHC ${parseFloat(p.price || 0).toFixed(2)}</p>
            <p class="product-meta"><i class="fas fa-tag"></i> ${p.category || '—'}</p>
            <p class="product-meta"><i class="fas fa-cubes"></i> Stock: ${stock}</p>
          </div>
          <div class="product-card-actions">
            <button class="btn-edit" onclick="editProduct(${realIndex})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-delete" onclick="confirmDelete(${realIndex})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
    }).join('');

    productGrid.innerHTML = html;
  }

  /* ---- Open Modal ---- */
  function openModal(title = 'Add New Product') {
    if (modalTitle) modalTitle.textContent = title;
    if (productModal) productModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (productModal) productModal.classList.remove('show');
    document.body.style.overflow = '';
    if (productForm) productForm.reset();
    editIndex = -1;
  }

  /* ---- Add Product ---- */
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      editIndex = -1;
      openModal('Add New Product');
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelBtn)     cancelBtn.addEventListener('click', closeModal);

  if (productModal) {
    productModal.addEventListener('click', e => {
      if (e.target === productModal) closeModal();
    });
  }

  /* ---- Form Submit ---- */
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const product = {
        name:        document.getElementById('productName').value.trim(),
        price:       parseFloat(document.getElementById('productPrice').value) || 0,
        category:    document.getElementById('productCategory').value,
        image:       document.getElementById('productImage').value.trim(),
        stock:       parseInt(document.getElementById('productStock').value) || 0,
        description: document.getElementById('productDescription')?.value.trim() || '',
        id:          editIndex >= 0 ? products[editIndex].id : Date.now()
      };

      if (!product.name) { showToast('Please enter a product name.', 'error'); return; }
      if (!product.price) { showToast('Please enter a valid price.', 'error'); return; }
      if (!product.category) { showToast('Please select a category.', 'error'); return; }

      let success = false;
      if (editIndex >= 0) {
        // Assumes an updateProductInSupabase function exists in supabase.js
        success = await updateProductInSupabase(products[editIndex]._supabaseId, product);
        if (success) showToast('Product updated successfully!');
      } else {
        success = await saveProductToSupabase(product);
        if (success) showToast('Product added successfully!');
      }

      if (success) {
        await loadAndRenderProducts(); // Reload data from Supabase
        closeModal();
      } else {
        showToast('Failed to save product to the database.', 'error');
      }
    });
  }

  /* ---- Edit ---- */
  window.editProduct = function(index) {
    const p = products[index];
    if (!p) return;
    editIndex = index;

    document.getElementById('productName').value        = p.name || '';
    document.getElementById('productPrice').value       = p.price || '';
    document.getElementById('productCategory').value    = p.category || '';
    document.getElementById('productImage').value       = p.image || '';
    document.getElementById('productStock').value       = p.stock || '';
    if (document.getElementById('productDescription')) {
      document.getElementById('productDescription').value = p.description || '';
    }

    openModal('Edit Product');
  };

  /* ---- Delete ---- */
  window.confirmDelete = function(index) {
    deleteIndex = index;
    if (deleteModal) deleteModal.classList.add('show');
  };

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      if (deleteModal) deleteModal.classList.remove('show');
      deleteIndex = -1;
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (deleteIndex >= 0) {
        products.splice(deleteIndex, 1);
        saveProducts();
        renderProducts();
        showToast('Product deleted.', 'error');
      }
      if (deleteModal) deleteModal.classList.remove('show');
      deleteIndex = -1;
    });
  }

  /* ---- Search & Filter ---- */
  if (searchInput)  searchInput.addEventListener('input', renderProducts);
  if (categoryFilter) categoryFilter.addEventListener('change', renderProducts);

  /* ---- Export CSV ---- */
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (products.length === 0) { showToast('No products to export.', 'error'); return; }
      const headers = ['Name', 'Price', 'Category', 'Stock', 'Image'];
      const rows    = products.map(p => [
        p.name, p.price, p.category, p.stock, p.image
      ].map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(','));
      const csv  = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `kathy-products-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Products exported!');
    });
  }

  /* ---- Mobile sidebar ---- */
  const mobileMenuBtn  = document.getElementById('mobileMenuBtn');
  const adminSidebar   = document.getElementById('adminSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      adminSidebar.classList.add('open');
      sidebarOverlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      adminSidebar.classList.remove('open');
      sidebarOverlay.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  /* ---- Init ---- */
  async function loadAndRenderProducts() {
    // Load products from Supabase on initial page load
    products = await fetchAllProducts();
    renderProducts();
  }

  loadAndRenderProducts();

});