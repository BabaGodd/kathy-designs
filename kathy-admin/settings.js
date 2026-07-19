/* =============================================
   SETTINGS.JS — Kathy Designs Admin
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  const toast = document.getElementById('toast');

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

  /* ---- Load saved settings ---- */
  const settings = JSON.parse(localStorage.getItem('kathySettings')) || {};

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  }

  function setCheck(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.checked = val;
  }

  setVal('storeName',        settings.storeName        || 'Kathy Designs');
  setVal('storePhone1',      settings.storePhone1      || '+233 244 510 810');
  setVal('storePhone2',      settings.storePhone2      || '+233 244 506 796');
  setVal('storeEmail',       settings.storeEmail       || 'kathydesigns@gmail.com');
  setVal('storeAddress',     settings.storeAddress     || '40 SOS Street, Tema');
  setVal('storeHoursWeekday',settings.storeHoursWeekday|| '9AM - 6PM');
  setVal('storeHoursSat',    settings.storeHoursSat    || '10AM - 4PM');
  setVal('adminName',        settings.adminName        || 'Admin');
  setVal('adminEmail',       settings.adminEmail       || '');
  setCheck('notifyOrders',   settings.notifyOrders   !== false);
  setCheck('notifyMessages', settings.notifyMessages !== false);
  setCheck('notifyStock',    settings.notifyStock    || false);

  /* ---- Save Store Info ---- */
  const saveStoreBtn = document.getElementById('saveStoreBtn');
  if (saveStoreBtn) {
    saveStoreBtn.addEventListener('click', () => {
      const s = JSON.parse(localStorage.getItem('kathySettings')) || {};
      s.storeName         = document.getElementById('storeName').value.trim();
      s.storePhone1       = document.getElementById('storePhone1').value.trim();
      s.storePhone2       = document.getElementById('storePhone2').value.trim();
      s.storeEmail        = document.getElementById('storeEmail').value.trim();
      s.storeAddress      = document.getElementById('storeAddress').value.trim();
      s.storeHoursWeekday = document.getElementById('storeHoursWeekday').value.trim();
      s.storeHoursSat     = document.getElementById('storeHoursSat').value.trim();
      localStorage.setItem('kathySettings', JSON.stringify(s));
      showToast('Store information saved! ✅');
    });
  }

  /* ---- Save Profile ---- */
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      const password        = document.getElementById('adminPassword').value;
      const passwordConfirm = document.getElementById('adminPasswordConfirm').value;

      if (password && password !== passwordConfirm) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      const s = JSON.parse(localStorage.getItem('kathySettings')) || {};
      s.adminName  = document.getElementById('adminName').value.trim();
      s.adminEmail = document.getElementById('adminEmail').value.trim();
      if (password) s.adminPassword = password;
      localStorage.setItem('kathySettings', JSON.stringify(s));

      document.getElementById('adminPassword').value        = '';
      document.getElementById('adminPasswordConfirm').value = '';
      showToast('Profile saved! ✅');
    });
  }

  /* ---- Save Notifications ---- */
  const saveNotifBtn = document.getElementById('saveNotifBtn');
  if (saveNotifBtn) {
    saveNotifBtn.addEventListener('click', () => {
      const s = JSON.parse(localStorage.getItem('kathySettings')) || {};
      s.notifyOrders   = document.getElementById('notifyOrders').checked;
      s.notifyMessages = document.getElementById('notifyMessages').checked;
      s.notifyStock    = document.getElementById('notifyStock').checked;
      localStorage.setItem('kathySettings', JSON.stringify(s));
      showToast('Notification preferences saved! ✅');
    });
  }

  /* ---- Danger Zone ---- */
  const clearOrdersBtn = document.getElementById('clearOrdersBtn');
  if (clearOrdersBtn) {
    clearOrdersBtn.addEventListener('click', () => {
      if (!confirm('Are you sure you want to clear ALL orders? This cannot be undone.')) return;
      localStorage.removeItem('kathyOrders');
      showToast('All orders cleared.', 'error');
    });
  }

  const clearMessagesBtn = document.getElementById('clearMessagesBtn');
  if (clearMessagesBtn) {
    clearMessagesBtn.addEventListener('click', () => {
      if (!confirm('Are you sure you want to clear ALL messages? This cannot be undone.')) return;
      localStorage.removeItem('kathyMessages');
      showToast('All messages cleared.', 'error');
    });
  }

  const resetDataBtn = document.getElementById('resetDataBtn');
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', () => {
      if (!confirm('WARNING: This will delete ALL data including orders, messages, products and settings. Are you absolutely sure?')) return;
      if (!confirm('Last chance — this cannot be undone. Continue?')) return;
      localStorage.removeItem('kathyOrders');
      localStorage.removeItem('kathyMessages');
      localStorage.removeItem('kathyProducts');
      localStorage.removeItem('kathySettings');
      localStorage.removeItem('kathyCustomers');
      showToast('All data has been reset.', 'error');
    });
  }

});