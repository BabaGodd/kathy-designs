/* =============================================
   MESSAGES.JS — Kathy Designs Admin
   Reads from Supabase with localStorage fallback
   ============================================= */

const SUPABASE_URL  = 'https://hkrnxfylhvfnqovduxjc.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrcm54ZnlsaHZmbnFvdmR1eGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4Nzk2OTEsImV4cCI6MjA5NDQ1NTY5MX0.zQKABL_eXWDtiEBDIsqN-sEoXsZR0Bc4NIRMO8kdJLw';

document.addEventListener('DOMContentLoaded', async () => {

  let messages = [];
  let filteredMessages = [];
  let activeIndex = null;

  const { createClient } = supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_ANON);

  const messagesTableBody  = document.getElementById('messagesTableBody');
  const searchInput        = document.getElementById('searchInput');
  const statusFilter       = document.getElementById('statusFilter');
  const resultsCount       = document.getElementById('resultsCount');
  const emptyState         = document.getElementById('emptyState');
  const markAllReadBtn     = document.getElementById('markAllReadBtn');
  const messageModal       = document.getElementById('messageModal');
  const modalSenderName    = document.getElementById('modalSenderName');
  const modalSenderEmail   = document.getElementById('modalSenderEmail');
  const modalMessageDate   = document.getElementById('modalMessageDate');
  const modalSubject       = document.getElementById('modalSubject');
  const modalMessageBody   = document.getElementById('modalMessageBody');
  const modalStatusBadge   = document.getElementById('modalStatusBadge');
  const closeModalBtn      = document.getElementById('closeModalBtn');
  const deleteMessageBtn   = document.getElementById('deleteMessageBtn');
  const replyBtn           = document.getElementById('replyBtn');
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const cancelDeleteBtn    = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn   = document.getElementById('confirmDeleteBtn');
  const toast              = document.getElementById('toast');
  const unreadCount        = document.getElementById('unreadCount');

  function showToast(message, type = 'info') {
    if (!toast) return;
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
    const map = { 'Unread':'badge-unread', 'Read':'badge-read', 'Replied':'badge-replied' };
    return `<span class="status-badge ${map[status] || 'badge-unread'}">${status || 'Unread'}</span>`;
  }

  // Load messages from Supabase
  async function loadMessages() {
    try {
      const { data, error } = await db
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      messages = data.map(row => ({
        name:        row.name,
        email:       row.email,
        subject:     row.subject,
        message:     row.message,
        status:      row.status,
        date:        row.created_at,
        _supabaseId: row.id
      }));

    } catch(err) {
      console.error('Supabase error, using localStorage:', err);
      messages = JSON.parse(localStorage.getItem('kathyMessages')) || [];
    }
  }

  function updateUnreadCount() {
    const count = messages.filter(m => m.status === 'Unread').length;
    if (unreadCount) unreadCount.textContent = count;
  }

  function applyFilters() {
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const status = statusFilter ? statusFilter.value : 'all';

    filteredMessages = messages.filter(msg => {
      const nameMatch    = (msg.name    || '').toLowerCase().includes(search);
      const emailMatch   = (msg.email   || '').toLowerCase().includes(search);
      const subjectMatch = (msg.subject || '').toLowerCase().includes(search);
      if (!nameMatch && !emailMatch && !subjectMatch) return false;
      if (status !== 'all' && msg.status !== status) return false;
      return true;
    });

    renderMessages();
  }

  function renderMessages() {
    if (!messagesTableBody) return;
    messagesTableBody.innerHTML = '';
    if (resultsCount) resultsCount.textContent = filteredMessages.length;

    if (filteredMessages.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    if (emptyState) emptyState.style.display = 'none';

    filteredMessages.forEach(msg => {
      const realIndex = messages.findIndex(m => m._supabaseId === msg._supabaseId);
      const tr = document.createElement('tr');
      if (msg.status === 'Unread') tr.classList.add('unread-row');
      tr.innerHTML = `
        <td><strong>${msg.name || '—'}</strong></td>
        <td>${msg.email || '—'}</td>
        <td>${msg.subject || '—'}</td>
        <td>${statusBadgeHTML(msg.status)}</td>
        <td style="color:#888;font-size:0.85rem;">${formatDate(msg.date)}</td>
        <td><button class="btn-view" data-index="${realIndex}"><i class="fas fa-eye"></i> View</button></td>
      `;
      messagesTableBody.appendChild(tr);
    });

    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', e => openMessageModal(parseInt(e.currentTarget.dataset.index)));
    });
  }

  async function openMessageModal(index) {
    const msg = messages[index];
    if (!msg) return;
    activeIndex = index;

    if (modalSenderName)  modalSenderName.textContent  = msg.name    || '—';
    if (modalSenderEmail) modalSenderEmail.textContent = msg.email   || '—';
    if (modalMessageDate) modalMessageDate.textContent = formatDate(msg.date);
    if (modalSubject)     modalSubject.textContent     = msg.subject || '—';
    if (modalMessageBody) modalMessageBody.textContent = msg.message || '—';
    if (modalStatusBadge) modalStatusBadge.innerHTML   = statusBadgeHTML(msg.status);

    if (messageModal) {
      messageModal.style.display    = 'flex';
      document.body.style.overflow  = 'hidden';
    }

    // Mark as Read automatically
    if (msg.status === 'Unread') {
      messages[index].status = 'Read';
      if (msg._supabaseId) {
        await db.from('messages').update({ status: 'Read' }).eq('id', msg._supabaseId);
      }
      if (modalStatusBadge) modalStatusBadge.innerHTML = statusBadgeHTML('Read');
      updateUnreadCount();
      applyFilters();
    }
  }

  function closeMessageModal() {
    if (messageModal) {
      messageModal.style.display   = 'none';
      document.body.style.overflow = '';
    }
    activeIndex = null;
  }

  if (closeModalBtn)  closeModalBtn.addEventListener('click', closeMessageModal);
  if (messageModal)   messageModal.addEventListener('click', e => { if (e.target === messageModal) closeMessageModal(); });

  // Reply
  if (replyBtn) {
    replyBtn.addEventListener('click', async () => {
      if (activeIndex === null) return;
      const msg = messages[activeIndex];
      window.location.href = `mailto:${msg.email}?subject=Re: ${msg.subject}`;

      messages[activeIndex].status = 'Replied';
      if (msg._supabaseId) {
        await db.from('messages').update({ status: 'Replied' }).eq('id', msg._supabaseId);
      }
      if (modalStatusBadge) modalStatusBadge.innerHTML = statusBadgeHTML('Replied');
      updateUnreadCount();
      applyFilters();
    });
  }

  // Delete
  if (deleteMessageBtn) deleteMessageBtn.addEventListener('click', () => { if (deleteConfirmModal) deleteConfirmModal.style.display = 'flex'; });
  if (cancelDeleteBtn)  cancelDeleteBtn.addEventListener('click',  () => { if (deleteConfirmModal) deleteConfirmModal.style.display = 'none'; });

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (activeIndex === null) return;
      const msg = messages[activeIndex];

      if (msg._supabaseId) {
        await db.from('messages').delete().eq('id', msg._supabaseId);
      }

      messages.splice(activeIndex, 1);
      updateUnreadCount();
      applyFilters();
      if (deleteConfirmModal) deleteConfirmModal.style.display = 'none';
      closeMessageModal();
      showToast('Message deleted.', 'error');
    });
  }

  // Mark all as read
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', async () => {
      for (const msg of messages) {
        if (msg.status === 'Unread') {
          msg.status = 'Read';
          if (msg._supabaseId) {
            await db.from('messages').update({ status: 'Read' }).eq('id', msg._supabaseId);
          }
        }
      }
      updateUnreadCount();
      applyFilters();
      showToast('All messages marked as read.', 'success');
    });
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);

  // Init
  await loadMessages();
  updateUnreadCount();
  applyFilters();

});