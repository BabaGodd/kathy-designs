document.addEventListener('DOMContentLoaded', () => {

  // ===== SET TODAY'S DATE =====
  const dateEl = document.getElementById('adminDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // ===== LOAD DATA FROM LOCALSTORAGE =====
  const orders = JSON.parse(localStorage.getItem('kathyOrders')) || [];
  const messages = JSON.parse(localStorage.getItem('kathyMessages')) || [];

  // ===== METRICS =====
  const totalSales = orders.reduce((acc, order) => acc + (order.total || 0), 0);
  const totalOrders = orders.length;
  const customersSet = new Set(orders.map(o => o.customer?.email || 'unknown'));
  const totalCustomers = customersSet.size;
  const pendingMessages = messages.filter(m => m.status === 'Pending').length;

  document.getElementById('totalSales').textContent = `GHC ${totalSales.toFixed(2)}`;
  document.getElementById('totalOrders').textContent = totalOrders;
  document.getElementById('totalCustomers').textContent = totalCustomers;
  document.getElementById('pendingMessages').textContent = pendingMessages;

  // ===== SALES CHART (Last 6 Months) =====
  const now = new Date();
  const monthsLabels = [];
  const salesData = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.toLocaleString('default', { month: 'short' });
    monthsLabels.push(month);

    const monthTotal = orders
      .filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.getFullYear() === date.getFullYear() &&
               orderDate.getMonth() === date.getMonth();
      })
      .reduce((acc, o) => acc + (o.total || 0), 0);

    salesData.push(monthTotal);
  }

  const salesCtx = document.getElementById('salesChart').getContext('2d');
  new Chart(salesCtx, {
    type: 'line',
    data: {
      labels: monthsLabels,
      datasets: [{
        label: 'Sales (GHC)',
        data: salesData,
        backgroundColor: 'rgba(255, 140, 0, 0.08)',
        borderColor: '#FF8C00',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#FF8C00',
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#333', font: { size: 13 } }
        },
        tooltip: {
          callbacks: {
            label: ctx => `GHC ${ctx.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        x: { ticks: { color: '#888' }, grid: { display: false } },
        y: {
          ticks: { color: '#888', callback: val => `GHC ${val}` },
          grid: { color: '#f0f0f0' }
        }
      }
    }
  });

  // ===== ORDER STATUS DOUGHNUT CHART =====
  const statusCounts = {
    Pending: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0
  };

  orders.forEach(o => {
    const s = o.status || 'Pending';
    if (statusCounts[s] !== undefined) statusCounts[s]++;
    else statusCounts['Pending']++;
  });

  const statusCtx = document.getElementById('statusChart').getContext('2d');
  new Chart(statusCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: ['#fff8e1', '#e3f2fd', '#e8f5e9', '#fce4ec'],
        borderColor: ['#f57f17', '#1565c0', '#2e7d32', '#c62828'],
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#333', font: { size: 12 }, padding: 16 }
        }
      }
    }
  });

  // ===== RECENT ORDERS TABLE =====
  const recentOrdersBody = document.getElementById('recentOrdersBody');
  recentOrdersBody.innerHTML = '';

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recentOrders.length === 0) {
    recentOrdersBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#aaa; padding: 24px;">
          <i class="fas fa-inbox" style="font-size:1.5rem; display:block; margin-bottom:8px;"></i>
          No recent orders found
        </td>
      </tr>`;
  } else {
    recentOrders.forEach(order => {
      const status = order.status || 'Pending';
      const statusClass = status.toLowerCase();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>#${order.orderID || 'N/A'}</strong></td>
        <td>${order.customer?.name || 'Unknown'}</td>
        <td>GHC ${(order.total || 0).toFixed(2)}</td>
        <td>${order.date ? new Date(order.date).toLocaleDateString('en-GB') : 'N/A'}</td>
        <td><span class="status ${statusClass}">${status}</span></td>
      `;
      recentOrdersBody.appendChild(tr);
    });
  }

});