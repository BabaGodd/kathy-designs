/* =============================================
   CUSTOMERS.JS — Kathy Designs Admin
   Features:
   - Derive customers from kathyOrders in localStorage
   - Summary stats: total customers, orders, revenue, top spender
   - Search by name, email, phone
   - Sort by name, most orders, highest spend
   - Initials avatar (auto-coloured)
   - Customer profile modal: contact details, stats, full order history
   - Export customers to CSV
   - Toast notifications
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- State ---- */
  const orders = JSON.parse(localStorage.getItem('kathyOrders')) || [];
  let customersArray = [];
  let filtered = [];

  /* ---- DOM refs ---- */
  const searchInput        = document.getElementById('searchInput');
  const sortFilter         = document.getElementById('sortFilter');
  const customersTableBody = document.getElementById('customersTableBody');
  const resultsCount       = document.getElementById('resultsCount');
  const emptyState         = document.getElementById('emptyState');
  const exportBtn          = document.getElementById('exportBtn');

  // Stats
  const statTotal      = document.getElementById('statTotal');
  const statOrders     = document.getElementById('statOrders');
  const statRevenue    = document.getElementById('statRevenue');
  const statTopSpender = document.getElementById('statTopSpender');

  // Modal
  const customerModal      = document.getElementById('customerModal');
  const closeCustomerModal = document.getElementById('closeCustomerModal');
  const modalAvatar        = document.getElementById('modalAvatar');
  const modalCustomerName  = document.getElementById('modalCustomerName');
  const modalCustomerEmail = document.getElementById('modalCustomerEmail');
  const modalPhone         = document.getElementById('modalPhone');
  const modalEmail         = document.getElementById('modalEmail');
  const modalLocation      = document.getElementById('modalLocation');
  const modalSince         = document.getElementById('modalSince');
  const modalTotalOrders   = document.getElementById('modalTotalOrders');
  const modalTotalSpent    = document.getElementById('modalTotalSpent');
  const modalAvgOrder      = document.getElementById('modalAvgOrder');
  const modalOrdersList    = document.getElementById('modalOrdersList');

  // Toast
  const toast = document.getElementById('toast');

  /* ================================================
     UTILITIES
  ================================================ */

  function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => { toast.className = 'toast'; }, 3000);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Generate initials from a name
  function getInitials(name) {
    if (!name || name === 'Unknown') return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Deterministic colour per customer (cycles through palette)
  const avatarColors = [
    '#FF8C00', '#e91e63', '#2196f3', '#4caf50',
    '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'
  ];

  function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }

  function statusBadge(status) {
    const map = {
      'Pending':   'badge-pending',
      'Shipped':   'badge-shipped',
      'Completed': 'badge-completed',
      'Cancelled': 'badge-cancelled',
    };
    return `<span class="modal-order-status ${map[status] || 'badge-pending'}">${status || 'Pending'}</span>`;
  }

  /* ================================================
     BUILD CUSTOMERS FROM ORDERS
  ================================================ */

  function buildCustomers() {
    const map = {};

    orders.forEach(order => {
      const cust  = order.customer || {};
      // Use phone as unique key (more reliable than email for Ghanaian context)
      const key   = (cust.phone || cust.email || 'unknown').toLowerCase().trim();

      if (!map[key]) {
        map[key] = {
          name:        cust.name     || 'Unknown',
          email:       cust.email    || '—',
          phone:       cust.phone    || '—',
          location:    cust.address  || cust.location || '—',
          totalOrders: 0,
          totalSpent:  0,
          firstOrder:  order.date,
          lastOrder:   order.date,
          orders:      []
        };
      }

      const c = map[key];
      c.totalOrders += 1;
      c.totalSpent  += parseFloat(order.total || 0);
      c.orders.push(order);

      // Track earliest and latest order dates
      if (new Date(order.date) < new Date(c.firstOrder)) c.firstOrder = order.date;
      if (new Date(order.date) > new Date(c.lastOrder))  c.lastOrder  = order.date;
    });

    customersArray = Object.values(map);
  }

  /* ================================================
     SUMMARY STATS
  ================================================ */

  function updateStats() {
    const totalCustomers = customersArray.length;
    const totalOrders    = orders.length;
    const totalRevenue   = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    const topSpender     = customersArray.reduce((top, c) => c.totalSpent > (top?.totalSpent || 0) ? c : top, null);

    statTotal.textContent      = totalCustomers;
    statOrders.textContent     = totalOrders;
    statRevenue.textContent    = `GHC ${totalRevenue.toFixed(2)}`;
    statTopSpender.textContent = topSpender ? topSpender.name.split(' ')[0] : '—';
  }

  /* ================================================
     FILTERS & SORT
  ================================================ */

  function applyFilters() {
    const search = searchInput.value.trim().toLowerCase();
    const sort   = sortFilter.value;

    filtered = customersArray.filter(c => {
      if (!search) return true;
      return (
        c.name.toLowerCase().includes(search)  ||
        c.email.toLowerCase().includes(search) ||
        c.phone.toLowerCase().includes(search)
      );
    });

    // Sort
    if (sort === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'orders') {
      filtered.sort((a, b) => b.totalOrders - a.totalOrders);
    } else if (sort === 'spent') {
      filtered.sort((a, b) => b.totalSpent - a.totalSpent);
    }

    renderTable();
  }

  /* ================================================
     RENDER TABLE
  ================================================ */

  function renderTable() {
    customersTableBody.innerHTML = '';
    resultsCount.textContent = filtered.length;

    if (filtered.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    filtered.forEach((customer, i) => {
      const initials = getInitials(customer.name);
      const color    = getAvatarColor(customer.name);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color:#aaa;font-size:0.85rem;">${i + 1}</td>
        <td>
          <div class="customer-name-cell">
            <div class="customer-avatar" style="background:${color};">${initials}</div>
            <span style="font-weight:600;color:#1e1e2d;">${customer.name}</span>
          </div>
        </td>
        <td>${customer.phone}</td>
        <td style="color:#888;">${customer.location}</td>
        <td>
          <span style="font-weight:700;color:#1e1e2d;">${customer.totalOrders}</span>
          <span style="color:#aaa;font-size:0.8rem;"> order${customer.totalOrders !== 1 ? 's' : ''}</span>
        </td>
        <td><strong style="color:#FF8C00;">GHC ${customer.totalSpent.toFixed(2)}</strong></td>
        <td style="color:#888;font-size:0.85rem;">${formatDate(customer.lastOrder)}</td>
        <td>
          <button class="btn-view" data-key="${customer.phone}">
            <i class="fas fa-eye"></i> View
          </button>
        </td>
      `;
      customersTableBody.appendChild(tr);
    });

    // Bind view buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', e => {
        const key      = e.currentTarget.dataset.key;
        const customer = customersArray.find(c => c.phone === key);
        if (customer) openCustomerModal(customer);
      });
    });
  }

  /* ================================================
     CUSTOMER PROFILE MODAL
  ================================================ */

  function openCustomerModal(customer) {
    const initials = getInitials(customer.name);
    const color    = getAvatarColor(customer.name);

    // Header
    modalAvatar.textContent         = initials;
    modalAvatar.style.background    = color;
    modalCustomerName.textContent   = customer.name;
    modalCustomerEmail.textContent  = customer.email !== '—' ? customer.email : 'No email on record';

    // Contact
    modalPhone.textContent    = customer.phone;
    modalEmail.textContent    = customer.email;
    modalLocation.textContent = customer.location;
    modalSince.textContent    = formatDate(customer.firstOrder);

    // Stats
    const avg = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;
    modalTotalOrders.textContent = customer.totalOrders;
    modalTotalSpent.textContent  = `GHC ${customer.totalSpent.toFixed(2)}`;
    modalAvgOrder.textContent    = `GHC ${avg.toFixed(2)}`;

    // Order history — newest first
    const sortedOrders = [...customer.orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    modalOrdersList.innerHTML = '';

    if (sortedOrders.length === 0) {
      modalOrdersList.innerHTML = '<p style="color:#aaa;font-size:0.88rem;">No orders found.</p>';
    } else {
      sortedOrders.forEach(order => {
        const row = document.createElement('div');
        row.className = 'modal-order-row';
        row.innerHTML = `
          <span class="modal-order-id">${order.orderID}</span>
          <span class="modal-order-date">${formatDate(order.date)}</span>
          <span class="modal-order-total">GHC ${parseFloat(order.total || 0).toFixed(2)}</span>
          ${statusBadge(order.status)}
        `;
        modalOrdersList.appendChild(row);
      });
    }

    customerModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    customerModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  closeCustomerModal.addEventListener('click', closeModal);
  customerModal.addEventListener('click', e => {
    if (e.target === customerModal) closeModal();
  });

  /* ================================================
     EXPORT TO CSV
  ================================================ */

  exportBtn.addEventListener('click', () => {
    if (customersArray.length === 0) {
      showToast('No customers to export.', 'info');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Location', 'Total Orders', 'Total Spent (GHC)', 'Last Order'];
    const rows = customersArray.map(c => [
      c.name,
      c.email,
      c.phone,
      c.location,
      c.totalOrders,
      c.totalSpent.toFixed(2),
      formatDate(c.lastOrder)
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `kathy-customers-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Customers exported to CSV!', 'success');
  });

  /* ================================================
     EVENT LISTENERS
  ================================================ */

  searchInput.addEventListener('input', applyFilters);
  sortFilter.addEventListener('change', applyFilters);

  /* ================================================
     INIT
  ================================================ */

  buildCustomers();
  updateStats();
  applyFilters();

});