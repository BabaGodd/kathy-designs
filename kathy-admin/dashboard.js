/* =============================================
   DASHBOARD.JS — Kathy Designs Admin
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Date ---- */
  const dateEl = document.getElementById('adminDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  /* ---- Load Data ---- */
  const orders   = JSON.parse(localStorage.getItem('kathyOrders'))   || [];
  const messages = JSON.parse(localStorage.getItem('kathyMessages')) || [];

  /* ---- Metrics ---- */
  const totalRevenue   = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const uniqueCustomers = [...new Set(orders.map(o => o.customer?.email).filter(Boolean))].length;
  const pendingMessages = messages.filter(m => m.status === 'Unread').length;

  const el = id => document.getElementById(id);
  if (el('totalSales'))      el('totalSales').textContent      = `GHC ${totalRevenue.toFixed(2)}`;
  if (el('totalOrders'))     el('totalOrders').textContent     = orders.length;
  if (el('totalCustomers'))  el('totalCustomers').textContent  = uniqueCustomers;
  if (el('pendingMessages')) el('pendingMessages').textContent = pendingMessages;

  /* ---- Sales Chart ---- */
  const salesCtx = document.getElementById('salesChart');
  if (salesCtx) {
    const months = [];
    const salesData = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleDateString('en-GB', { month: 'short' }));
      const monthTotal = orders
        .filter(o => {
          const od = new Date(o.date);
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
        })
        .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
      salesData.push(monthTotal);
    }

    new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Sales (GHC)',
          data: salesData,
          borderColor: '#FF8C00',
          backgroundColor: 'rgba(255,140,0,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#FF8C00',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `GHC ${ctx.raw.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              callback: val => `GHC ${val}`,
              font: { size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        }
      }
    });
  }

  /* ---- Status Doughnut Chart ---- */
  const statusCtx = document.getElementById('statusChart');
  if (statusCtx) {
    const pending   = orders.filter(o => o.status === 'Pending').length;
    const shipped   = orders.filter(o => o.status === 'Shipped').length;
    const completed = orders.filter(o => o.status === 'Completed').length;
    const cancelled = orders.filter(o => o.status === 'Cancelled').length;

    new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Shipped', 'Completed', 'Cancelled'],
        datasets: [{
          data: [pending, shipped, completed, cancelled],
          backgroundColor: ['#FF8C00', '#1565c0', '#2e7d32', '#c62828'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 11 },
              padding: 12,
              usePointStyle: true
            }
          }
        }
      }
    });
  }

  /* ---- Recent Orders ---- */
  const tbody = document.getElementById('recentOrdersBody');
  if (tbody) {
    const recent = [...orders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#aaa;padding:2rem;">No orders yet</td></tr>`;
    } else {
      const statusColors = {
        'Pending':   'badge-pending',
        'Shipped':   'badge-shipped',
        'Completed': 'badge-completed',
        'Cancelled': 'badge-cancelled'
      };
      tbody.innerHTML = recent.map(o => `
        <tr>
          <td><strong>${o.orderID || '—'}</strong></td>
          <td>${o.customer?.name || '—'}</td>
          <td><strong style="color:#FF8C00;">GHC ${parseFloat(o.total||0).toFixed(2)}</strong></td>
          <td style="color:#888;font-size:0.82rem;">${new Date(o.date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</td>
          <td><span class="status-badge ${statusColors[o.status]||'badge-pending'}">${o.status||'Pending'}</span></td>
        </tr>
      `).join('');
    }
  }

});