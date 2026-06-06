// =======================
// Helper Functions
// =======================
function saveProductsToStorage(products) {
  localStorage.setItem('kathyProducts', JSON.stringify(products));
}

function loadProductsFromStorage() {
  return JSON.parse(localStorage.getItem('kathyProducts')) || [];
}

function renderProductTable(products) {
  const tableBody = document.getElementById('product-management-body');
  tableBody.innerHTML = '';

  products.forEach((product, index) => {
    const row = document.createElement('tr');
    row.dataset.index = index;
    row.innerHTML = `
      <td class="product-info">
        <img src="${product.image || 'assets/OrangeBag.JPG'}" />
        <span>${product.name}</span>
      </td>
      <td>${product.category}</td>
      <td>GHC ${parseFloat(product.price).toFixed(2)}</td>
      <td>${product.stock}</td>
      <td><span class="status active">${product.status || 'Active'}</span></td>
      <td class="actions">
        <button class="btn edit">Edit</button>
        <button class="btn delete">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  bindEditButtons();
  bindDeleteButtons();
}

// =======================
// Global Variables
// =======================
let products = loadProductsFromStorage();
let editingRow = null;

// =======================
// On Page Load
// =======================
document.addEventListener('DOMContentLoaded', () => {
  renderProductTable(products);

  
  // Sidebar active link toggle
  document.querySelectorAll('.admin-sidebar li').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.admin-sidebar li').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // =======================
  // Chart.js Sales Chart
  // =======================
  const ctx = document.getElementById('salesChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Sales (GHC)',
        data: [1500, 2000, 3000, 2500, 3200, 4000],
        backgroundColor: 'rgba(126, 91, 239, 0.1)',
        borderColor: '#7E5BEF',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#333', font: { size: 14 } }
        }
      },
      scales: {
        x: { ticks: { color: '#666' }, grid: { display: false } },
        y: { ticks: { color: '#666' }, grid: { color: '#eee' } }
      }
    }
  });


// =======================
// Toast Notification Helper
// =======================
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}



  // =======================
  // Orders Table
  // =======================
  const orders = JSON.parse(localStorage.getItem('kathyOrders')) || [];
  const ordersBody = document.getElementById('orders-table-body');
  ordersBody.innerHTML = '';

  if (orders.length === 0) {
    ordersBody.innerHTML = `<tr><td colspan="6">No orders found</td></tr>`;
  } else {
    orders.forEach((order, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${order.orderID}</td>
        <td>${order.customer?.name || 'Unknown'}</td>
        <td>${order.customer?.phone || 'N/A'}</td>
        <td>GHC ${order.total.toFixed(2)}</td>
        <td>
          <select class="order-status-dropdown" data-index="${index}">
            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>
          <button class="btn view-order" data-index="${index}">View</button>
        </td>
      `;
      ordersBody.appendChild(row);
    });

    // Listen for status changes
    document.querySelectorAll('.order-status-dropdown').forEach(dropdown => {
      dropdown.addEventListener('change', (e) => {
        const index = e.target.dataset.index;
        orders[index].status = e.target.value;
        localStorage.setItem('kathyOrders', JSON.stringify(orders));

        showToast('Order status updated successfully');
      });
    });

    // Listen for view order clicks
    document.querySelectorAll('.view-order').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        showOrderModal(orders[index]);
      });
    });
  }

  // =======================
  // Product Modal Controls
  // =======================
  const modal = document.getElementById('productModal');
  document.getElementById('addProductBtn').addEventListener('click', () => modal.classList.add('show'));
  document.getElementById('cancelModal').addEventListener('click', () => {
    editingRow = null;
    modal.classList.remove('show');
  });

  // Add/Edit Product Submit
  document.getElementById('productForm').addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = Object.fromEntries(formData.entries());

    product.price = parseFloat(product.price);
    product.stock = parseInt(product.stock);
    product.image = product.image || 'assets/OrangeBag.JPG';
    product.status = 'Active';

    if (editingRow) {
      const index = editingRow.dataset.index;
      products[index] = product;
      editingRow = null;
    } else {
      products.push(product);
    }

    saveProductsToStorage(products);
    renderProductTable(products);

    modal.classList.remove('show');
    e.target.reset();
  });
});

// =======================
// Edit/Delete Buttons
// =======================
function bindEditButtons() {
  document.querySelectorAll('.btn.edit').forEach(button => {
    button.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      editingRow = row;

      const index = row.dataset.index;
      const product = products[index];

      document.querySelector('#productForm input[name="name"]').value = product.name;
      document.querySelector('#productForm select[name="category"]').value = product.category;
      document.querySelector('#productForm input[name="price"]').value = product.price;
      document.querySelector('#productForm input[name="stock"]').value = product.stock;

      document.getElementById('productModal').classList.add('show');
    });
  });
}

function bindDeleteButtons() {
  document.querySelectorAll('.btn.delete').forEach(button => {
    button.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      const index = row.dataset.index;
      const productName = products[index].name;

      if (confirm(`Are you sure you want to delete "${productName}"?`)) {
        products.splice(index, 1);
        saveProductsToStorage(products);
        renderProductTable(products);
      }
    });
  });
}

// =======================
// Show Order Modal
// =======================
function showOrderModal(order) {
  document.getElementById('modal-order-id').innerText = order.orderID;
  document.getElementById('modal-customer-name').innerText = order.customer?.name || 'Unknown';
  document.getElementById('modal-customer-phone').innerText = order.customer?.phone || 'N/A';
  document.getElementById('modal-order-date').innerText = new Date(order.date).toLocaleDateString();
  document.getElementById('modal-order-total').innerText = `GHC ${order.total.toFixed(2)}`;

  const itemsList = document.getElementById('modal-order-items');
  itemsList.innerHTML = '';
  order.items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} (x${item.quantity}) - GHC ${item.price.toFixed(2)}`;
    itemsList.appendChild(li);
  });

  document.getElementById('viewOrderModal').classList.add('show');
}

document.getElementById('closeOrderModal').addEventListener('click', () => {
  document.getElementById('viewOrderModal').classList.remove('show');
});
