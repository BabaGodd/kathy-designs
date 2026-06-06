/* =============================================
   ORDERS.JS — Kathy Designs Admin
   Reads from Supabase with localStorage fallback
   ============================================= */

const SUPABASE_URL  = 'https://hkrnxfylhvfnqovduxjc.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrcm54ZnlsaHZmbnFvdmR1eGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4Nzk2OTEsImV4cCI6MjA5NDQ1NTY5MX0.zQKABL_eXWDtiEBDIsqN-sEoXsZR0Bc4NIRMO8kdJLw';

document.addEventListener('DOMContentLoaded', async () => {

  let orders = [];
  let filteredOrders = [];
  let activeOrderIndex = null;

  const ordersTableBody    = document.getElementById('ordersTableBody');
  const searchInput        = document.getElementById('searchInput');
  const statusFilter       = document.getElementById('statusFilter');
  const dateFilter         = document.getElementById('dateFilter');
  const resultsCount       = document.getElementById('resultsCount');
  const emptyState         = document.getElementById('emptyState');
  const exportBtn          = document.getElementById('exportBtn');
  const statTotal          = document.getElementById('statTotal');
  const statPending        = document.getElementById('statPending');
  const statShipped        = document.getElementById('statShipped');
  const statCompleted      = document.getElementById('statCompleted');
  const statRevenue        = document.getElementById('statRevenue');
  const orderModal         = document.getElementById('orderDetailsModal');
  const modalOrderID       = document.getElementById('modalOrderID');
  const modalOrderDate     = document.getElementById('modalOrderDate');
  const modalCustomerName  = document.getElementById('modalCustomerName');
  const modalCustomerPhone = document.getElementById('modalCustomerPhone');
  const modalCustomerEmail = document.getElementById('modalCustomerEmail');
  const modalCustomerAddress = document.getElementById('modalCustomerAddress');
  const modalStatusBadge   = document.getElementById('modalStatusBadge');
  const modalPayment       = document.getElementById('modalPayment');
  const modalDelivery      = document.getElementById('modalDelivery');
  const modalNotes         = document.getElementById('modalNotes');
  const modalOrderItems    = document.getElementById('modalOrderItems');
  const modalOrderTotal    = document.getElementById('modalOrderTotal');
  const modalStatusSelect  = document.getElementById('modalStatusSelect');
  const closeOrderModalBtn = document.getElementById('closeOrderModalBtn');
  const saveStatusBtn      = document.getElementById('saveStatusBtn');
  const deleteOrderBtn     = document.getElementById('deleteOrderBtn');
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const cancelDeleteBtn    = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn   = document.getElementById('confirmDeleteBtn');
  const toast              = document.getElementById('toast');

  // Init Supabase
  const { createClient } = supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_ANON);

  function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => { toast.className = 'toast'; }, 3000);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function statusBadgeHTML(status) {
    const map = { 'Pending':'badge-pending','Shipped':'badge-shipped','Completed':'badge-completed','Cancelled':'badge-cancelled' };
    return `<span class="status-badge ${map[status] || 'badge-pending'}">${status || 'Pending'}</span>`;
  }

  // Load orders from Supabase
  async function loadOrders() {
    try {
      const { data, error } = await db
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      orders = data.map(row => ({
        orderID:        row.order_id,
        customer: {
          name:    row.customer_name,
          email:   row.customer_email,
          phone:   row.customer_phone,
          address: row.customer_address,
        },
        items:          row.items || [],
        subtotal:       row.subtotal,
        deliveryFee:    row.delivery_fee,
        total:          row.total,
        paymentMethod:  row.payment_method,
        deliveryMethod: row.delivery_method,
        notes:          row.notes,
        status:         row.status,
        date:           row.created_at,
        _supabaseId:    row.id
      }));

    } catch(err) {
      console.error('Supabase error, using localStorage:', err);
      orders = JSON.parse(localStorage.getItem('kathyOrders')) || [];
    }
  }

  function updateStats() {
    statTotal.textContent     = orders.length;
    statPending.textContent   = orders.filter(o => o.status === 'Pending').length;
    statShipped.textContent   = orders.filter(o => o.status === 'Shipped').length;
    statCompleted.textContent = orders.filter(o => o.status === 'Completed').length;
    statRevenue.textContent   = `GHC ${orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0).toFixed(2)}`;
  }

  function applyFilters() {
    const search    = searchInput.value.trim().toLowerCase();
    const status    = statusFilter.value;
    const dateRange = dateFilter.value;
    const now       = new Date();
    const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    filteredOrders = orders.filter(order => {
      const idMatch   = (order.orderID || '').toLowerCase().includes(search);
      const nameMatch = (order.customer?.name || '').toLowerCase().includes(search);
      if (!idMatch && !nameMatch) return false;
      if (status !== 'all' && order.status !== status) return false;
      if (dateRange !== 'all') {
        const orderDate = new Date(order.date);
        if (isNaN(orderDate)) return false;
        if (dateRange === 'today') {
          const d = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
          if (d.getTime() !== today.getTime()) return false;
        }
        if (dateRange === 'week') {
          const w = new Date(today); w.setDate(today.getDate() - 7);
          if (orderDate < w) return false;
        }
        if (dateRange === 'month') {
          const m = new Date(today); m.setMonth(today.getMonth() - 1);
          if (orderDate < m) return false;
        }
      }
      return true;
    });
    renderOrders();
  }

  function renderOrders() {
    ordersTableBody.innerHTML = '';
    resultsCount.textContent  = filteredOrders.length;

    if (filteredOrders.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    [...filteredOrders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(order => {
        const realIndex = orders.findIndex(o => o.orderID === order.orderID);
        const itemCount = (order.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${order.orderID}</strong></td>
          <td>${order.customer?.name || 'Unknown'}</td>
          <td>${order.customer?.phone || '—'}</td>
          <td><span style="color:#888;font-size:0.85rem;">${itemCount} item${itemCount !== 1 ? 's' : ''}</span></td>
          <td><strong style="color:#FF8C00;">GHC ${parseFloat(order.total || 0).toFixed(2)}</strong></td>
          <td>${statusBadgeHTML(order.status)}</td>
          <td style="color:#888;font-size:0.85rem;">${formatDate(order.date)}</td>
          <td><button class="btn-view" data-index="${realIndex}"><i class="fas fa-eye"></i> View</button></td>
        `;
        ordersTableBody.appendChild(tr);
      });

    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', e => openOrderModal(parseInt(e.currentTarget.dataset.index)));
    });
  }

  function openOrderModal(index) {
    const order = orders[index];
    if (!order) return;
    activeOrderIndex = index;

    modalOrderID.textContent           = order.orderID;
    modalOrderDate.textContent         = formatDate(order.date);
    modalCustomerName.textContent      = order.customer?.name    || '—';
    modalCustomerPhone.textContent     = order.customer?.phone   || '—';
    modalCustomerEmail.textContent     = order.customer?.email   || '—';
    modalCustomerAddress.textContent   = order.customer?.address || '—';
    modalStatusBadge.innerHTML         = statusBadgeHTML(order.status);
    modalPayment.textContent           = order.paymentMethod  || '—';
    modalDelivery.textContent          = order.deliveryMethod || '—';
    modalNotes.textContent             = order.notes          || '—';
    modalStatusSelect.value            = order.status         || 'Pending';
    modalOrderTotal.textContent        = parseFloat(order.total || 0).toFixed(2);

    modalOrderItems.innerHTML = '';
    (order.items || []).forEach(item => {
      const qty   = item.quantity || 1;
      const price = parseFloat(item.price || 0);
      const row   = document.createElement('div');
      row.className = 'modal-item-row';
      row.innerHTML = `
        <div><span class="modal-item-name">${item.name}</span><span class="modal-item-qty">×${qty}</span></div>
        <span class="modal-item-price">GHC ${(price * qty).toFixed(2)}</span>
      `;
      modalOrderItems.appendChild(row);
    });

    orderModal.style.display    = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeOrderModal() {
    orderModal.style.display    = 'none';
    document.body.style.overflow = '';
    activeOrderIndex = null;
  }

  closeOrderModalBtn.addEventListener('click', closeOrderModal);
  orderModal.addEventListener('click', e => { if (e.target === orderModal) closeOrderModal(); });

  // Save status
  saveStatusBtn.addEventListener('click', async () => {
    if (activeOrderIndex === null) return;
    const newStatus = modalStatusSelect.value;
    const order     = orders[activeOrderIndex];
    orders[activeOrderIndex].status = newStatus;

    if (order._supabaseId) {
      await db.from('orders').update({ status: newStatus }).eq('id', order._supabaseId);
    }

    updateStats();
    applyFilters();
    modalStatusBadge.innerHTML = statusBadgeHTML(newStatus);
    showToast(`Status updated to "${newStatus}"`, 'success');
  });

  // Delete
  deleteOrderBtn.addEventListener('click', () => { deleteConfirmModal.style.display = 'flex'; });
  cancelDeleteBtn.addEventListener('click', () => { deleteConfirmModal.style.display = 'none'; });

  confirmDeleteBtn.addEventListener('click', async () => {
    if (activeOrderIndex === null) return;
    const order = orders[activeOrderIndex];

    if (order._supabaseId) {
      await db.from('orders').delete().eq('id', order._supabaseId);
    }

    orders.splice(activeOrderIndex, 1);
    updateStats();
    applyFilters();
    deleteConfirmModal.style.display = 'none';
    closeOrderModal();
    showToast('Order deleted.', 'error');
  });

  // Export CSV
  exportBtn.addEventListener('click', () => {
    if (orders.length === 0) { showToast('No orders to export.', 'info'); return; }
    const headers = ['Order ID','Customer','Phone','Email','Total','Status','Date'];
    const rows    = orders.map(o => [
      o.orderID, o.customer?.name, o.customer?.phone, o.customer?.email,
      parseFloat(o.total||0).toFixed(2), o.status, formatDate(o.date)
    ].map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(','));
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `kathy-orders-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported!', 'success');
  });

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  dateFilter.addEventListener('change', applyFilters);

  // Init
  await loadOrders();
  updateStats();
  applyFilters();

});