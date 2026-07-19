/* =============================================
   CUSTOMERS.JS — Kathy Designs Admin
   Derives customer data from orders
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  const customersTableBody = document.getElementById('customersTableBody');
  const searchInput        = document.getElementById('searchInput');
  const resultsCount       = document.getElementById('resultsCount');
  const emptyState         = document.getElementById('emptyState');
  const exportBtn          = document.getElementById('exportBtn');
  const toast              = document.getElementById('toast');

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

  /* ---- Toast ---- */
  function showToast(message, type = 'success') {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => { toast.className = 'toast'; }, 3000);
  }

  /* ---- Format date ---- */
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  /* ---- Load & derive customers from orders ---- */
  const orders = JSON.parse(localStorage.getItem('kathyOrders')) || [];

  // Group orders by email
  const customerMap = {};
  orders.forEach(order => {
    const email = order.customer?.email || 'unknown';
    if (!customerMap[email]) {
      customerMap[email] = {
        name:       order.customer?.name    || 'Unknown',
        email:      email,
        phone:      order.customer?.phone   || '—',
        address:    order.customer?.address || '—',
        orders:     0,
        totalSpent: 0,
        lastOrder:  null
      };
    }
    customerMap[email].orders++;
    customerMap[email].totalSpent += parseFloat(order.total || 0);
    const orderDate = new Date(order.date);
    if (!customerMap[email].lastOrder || orderDate > new Date(customerMap[email].lastOrder)) {
      customerMap[email].lastOrder = order.date;
    }
  });

  let customers = Object.values(customerMap);

  /* ---- Stats ---- */
  const totalRevenue  = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const returning     = customers.filter(c => c.orders > 1).length;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const el = id => document.getElementById(id);
  if (el('totalCustomers'))    el('totalCustomers').textContent    = customers.length;
  if (el('returningCustomers'))el('returningCustomers').textContent = returning;
  if (el('totalRevenue'))      el('totalRevenue').textContent      = `GHC ${totalRevenue.toFixed(2)}`;
  if (el('avgOrderValue'))     el('avgOrderValue').textContent     = `GHC ${avgOrderValue.toFixed(2)}`;

  /* ---- Render ---- */
  function renderCustomers() {
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const filtered = customers.filter(c =>
      !search ||
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.phone.toLowerCase().includes(search)
    );

    if (resultsCount) resultsCount.textContent = filtered.length;

    if (filtered.length === 0) {
      customersTableBody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    customersTableBody.innerHTML = filtered
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .map(c => `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:34px;height:34px;border-radius:50%;background:#fff3e0;color:#FF8C00;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;flex-shrink:0;">
                ${c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-weight:600;color:#1e1e2d;">${c.name}</div>
                ${c.orders > 1 ? '<span style="font-size:0.7rem;background:#e8f5e9;color:#2e7d32;padding:1px 6px;border-radius:10px;font-weight:600;">Returning</span>' : ''}
              </div>
            </div>
          </td>
          <td style="color:#555;">${c.email}</td>
          <td style="color:#555;">${c.phone}</td>
          <td><strong style="color:#FF8C00;">${c.orders}</strong></td>
          <td><strong style="color:#1e1e2d;">GHC ${c.totalSpent.toFixed(2)}</strong></td>
          <td style="color:#888;font-size:0.82rem;">${formatDate(c.lastOrder)}</td>
        </tr>
      `).join('');
  }

  if (searchInput) searchInput.addEventListener('input', renderCustomers);

  /* ---- Export CSV ---- */
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (customers.length === 0) { showToast('No customers to export.', 'error'); return; }
      const headers = ['Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Last Order'];
      const rows    = customers.map(c => [
        c.name, c.email, c.phone, c.orders,
        c.totalSpent.toFixed(2), formatDate(c.lastOrder)
      ].map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(','));
      const csv  = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `kathy-customers-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Customers exported!');
    });
  }

  renderCustomers();

});