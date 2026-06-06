/* =============================================
   SETTINGS.JS — Kathy Designs Admin
   Features:
   - Tabbed section navigation (Store / Admin / Notifications / Danger)
   - Store info saved to localStorage (kathySettings)
   - Admin profile with live avatar preview
   - Password change with show/hide toggle + validation
   - Notification toggles saved to localStorage
   - Danger zone: clear orders, messages, products, or everything
   - Confirm modal for all destructive actions
   - Toast notifications
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ================================================
     TOAST
  ================================================ */
  const toast = document.getElementById('toast');

  function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => { toast.className = 'toast'; }, 3000);
  }

  /* ================================================
     SECTION NAVIGATION (tabs)
  ================================================ */
  const navBtns   = document.querySelectorAll('.settings-nav-btn');
  const sections  = document.querySelectorAll('.settings-section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.section;

      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`section-${target}`).classList.add('active');
    });
  });

  /* ================================================
     LOAD SAVED SETTINGS
  ================================================ */
  const saved = JSON.parse(localStorage.getItem('kathySettings')) || {};

  /* ================================================
     STORE INFO
  ================================================ */
  const storeFields = ['storeName', 'storeTagline', 'storeEmail', 'storePhone',
                       'storeAddress', 'storeCurrency', 'storeDeliveryFee', 'storeSocial'];

  // Populate saved values
  storeFields.forEach(id => {
    const el = document.getElementById(id);
    if (el && saved[id] !== undefined) el.value = saved[id];
  });

  document.getElementById('saveStoreBtn').addEventListener('click', () => {
    storeFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) saved[id] = el.value.trim();
    });
    localStorage.setItem('kathySettings', JSON.stringify(saved));
    showToast('Store information saved!', 'success');
  });

  /* ================================================
     ADMIN PROFILE
  ================================================ */
  const adminNameInput  = document.getElementById('adminName');
  const adminEmailInput = document.getElementById('adminEmail');
  const adminRoleInput  = document.getElementById('adminRole');
  const avatarDisplay   = document.getElementById('adminAvatarDisplay');
  const avatarName      = document.getElementById('avatarNameDisplay');
  const avatarRole      = document.getElementById('avatarRoleDisplay');

  // Populate
  if (saved.adminName)  adminNameInput.value  = saved.adminName;
  if (saved.adminEmail) adminEmailInput.value = saved.adminEmail;
  if (saved.adminRole)  adminRoleInput.value  = saved.adminRole;

  // Live avatar preview
  function updateAvatar() {
    const name = adminNameInput.value.trim();
    const role = adminRoleInput.value;
    if (name) {
      const parts    = name.split(' ');
      const initials = parts.length >= 2
        ? parts[0][0] + parts[parts.length - 1][0]
        : parts[0].slice(0, 2);
      avatarDisplay.textContent = initials.toUpperCase();
      avatarName.textContent    = name;
    } else {
      avatarDisplay.textContent = 'KD';
      avatarName.textContent    = 'Admin';
    }
    avatarRole.textContent = role || 'Administrator';
  }

  adminNameInput.addEventListener('input', updateAvatar);
  adminRoleInput.addEventListener('change', updateAvatar);
  updateAvatar(); // run on load

  // Password show/hide toggles
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input    = document.getElementById(targetId);
      const icon     = btn.querySelector('i');
      if (input.type === 'password') {
        input.type   = 'text';
        icon.className = 'fas fa-eye-slash';
      } else {
        input.type   = 'password';
        icon.className = 'fas fa-eye';
      }
    });
  });

  // Save admin profile
  document.getElementById('saveAdminBtn').addEventListener('click', () => {
    const name     = adminNameInput.value.trim();
    const email    = adminEmailInput.value.trim();
    const role     = adminRoleInput.value;
    const current  = document.getElementById('currentPassword').value;
    const newPass  = document.getElementById('newPassword').value;
    const confirm  = document.getElementById('confirmPassword').value;

    if (!name || !email) {
      showToast('Name and email are required.', 'error');
      return;
    }

    // Password validation (only if user typed something)
    if (newPass || confirm || current) {
      if (!current) {
        showToast('Please enter your current password.', 'error');
        return;
      }
      if (newPass.length < 8) {
        showToast('New password must be at least 8 characters.', 'error');
        return;
      }
      if (newPass !== confirm) {
        showToast('New passwords do not match.', 'error');
        return;
      }
      // Save password hash placeholder (real auth handled by Supabase later)
      saved.adminPassword = newPass;

      // Clear password fields
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value     = '';
      document.getElementById('confirmPassword').value = '';
    }

    saved.adminName  = name;
    saved.adminEmail = email;
    saved.adminRole  = role;

    localStorage.setItem('kathySettings', JSON.stringify(saved));
    updateAvatar();
    showToast('Admin profile saved!', 'success');
  });

  /* ================================================
     NOTIFICATIONS
  ================================================ */
  const notifIds = ['notifOrders', 'notifMessages', 'notifStock',
                    'notifStatusUpdates', 'notifWeeklySummary'];

  // Load saved notification prefs
  const savedNotifs = saved.notifications || {};
  notifIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && savedNotifs[id] !== undefined) {
      el.checked = savedNotifs[id];
    }
  });

  document.getElementById('saveNotifBtn').addEventListener('click', () => {
    const notifs = {};
    notifIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) notifs[id] = el.checked;
    });
    saved.notifications = notifs;
    localStorage.setItem('kathySettings', JSON.stringify(saved));
    showToast('Notification preferences saved!', 'success');
  });

  /* ================================================
     DANGER ZONE
  ================================================ */
  const confirmModal    = document.getElementById('confirmModal');
  const confirmTitle    = document.getElementById('confirmTitle');
  const confirmText     = document.getElementById('confirmText');
  const cancelConfirm   = document.getElementById('cancelConfirmBtn');
  const proceedConfirm  = document.getElementById('proceedConfirmBtn');

  let pendingAction = null;

  const dangerActions = {
    clearOrders: {
      title: 'Clear All Orders?',
      text:  'This will permanently delete all orders from localStorage. This cannot be undone.',
      run:   () => {
        localStorage.removeItem('kathyOrders');
        showToast('All orders cleared.', 'error');
      }
    },
    clearMessages: {
      title: 'Clear All Messages?',
      text:  'This will permanently delete all customer messages. This cannot be undone.',
      run:   () => {
        localStorage.removeItem('kathyMessages');
        showToast('All messages cleared.', 'error');
      }
    },
    clearProducts: {
      title: 'Clear All Products?',
      text:  'This will permanently delete all products from localStorage. This cannot be undone.',
      run:   () => {
        localStorage.removeItem('kathyProducts');
        showToast('All products cleared.', 'error');
      }
    },
    resetAll: {
      title: 'Reset Everything?',
      text:  'This will wipe ALL data — orders, messages, products, and settings. Full factory reset. Cannot be undone.',
      run:   () => {
        ['kathyOrders', 'kathyMessages', 'kathyProducts',
         'kathyCart', 'kathySettings'].forEach(key => localStorage.removeItem(key));
        showToast('All data has been reset.', 'error');
      }
    }
  };

  document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (!dangerActions[action]) return;
      pendingAction        = action;
      confirmTitle.textContent = dangerActions[action].title;
      confirmText.textContent  = dangerActions[action].text;
      confirmModal.style.display = 'flex';
    });
  });

  cancelConfirm.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    pendingAction = null;
  });

  confirmModal.addEventListener('click', e => {
    if (e.target === confirmModal) {
      confirmModal.style.display = 'none';
      pendingAction = null;
    }
  });

  proceedConfirm.addEventListener('click', () => {
    if (pendingAction && dangerActions[pendingAction]) {
      dangerActions[pendingAction].run();
    }
    confirmModal.style.display = 'none';
    pendingAction = null;
  });

});