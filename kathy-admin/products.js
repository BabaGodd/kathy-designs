// ===========================
// KATHY DESIGNS - PRODUCTS JS
// ===========================

// ===== DATE =====
const dateEl = document.getElementById('adminDate');
if (dateEl) {
  dateEl.textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ===== LOAD PRODUCTS FROM LOCALSTORAGE OR USE DEFAULTS =====
const defaultProducts = [
  // WOMEN
  { id: 1,  name: 'Floral Summer Dress',    category: 'women',      price: 150, stock: 'in-stock',    sizes: ['S','M','L','XL'], colors: ['Red','Orange','Green'], image: 'assets/Fendi-black.jpg' },
  { id: 2,  name: 'Stylish Blouse',          category: 'women',      price: 100, stock: 'in-stock',    sizes: ['M','L'],          colors: ['Blue','White'],        image: 'assets/OrangeBag.JPG' },
  { id: 3,  name: 'Kente Wrap Dress',        category: 'women',      price: 200, stock: 'in-stock',    sizes: ['S','M','L'],      colors: ['Gold','Green'],        image: 'assets/placeholder.jpg' },
  { id: 4,  name: 'Ankara Maxi Dress',       category: 'women',      price: 180, stock: 'low-stock',   sizes: ['M','L','XL'],     colors: ['Blue','Yellow'],       image: 'assets/placeholder.jpg' },
  { id: 5,  name: 'Lace Top',                category: 'women',      price: 120, stock: 'in-stock',    sizes: ['S','M'],          colors: ['White','Cream'],       image: 'assets/placeholder.jpg' },
  { id: 6,  name: 'Silk Evening Gown',       category: 'women',      price: 350, stock: 'low-stock',   sizes: ['S','M','L'],      colors: ['Black','Gold'],        image: 'assets/placeholder.jpg' },
  { id: 7,  name: 'Peplum Top',              category: 'women',      price: 90,  stock: 'in-stock',    sizes: ['XS','S','M'],     colors: ['Pink','Purple'],       image: 'assets/placeholder.jpg' },

  // MEN
  { id: 8,  name: 'Casual Cotton Shirt',     category: 'men',        price: 120, stock: 'in-stock',    sizes: ['M','L','XL'],     colors: ['White','Black'],       image: 'assets/placeholder.jpg' },
  { id: 9,  name: 'Denim Jacket',            category: 'men',        price: 200, stock: 'in-stock',    sizes: ['L','XL'],         colors: ['Blue','Black'],        image: 'assets/placeholder.jpg' },
  { id: 10, name: 'Kente Print Shirt',       category: 'men',        price: 160, stock: 'in-stock',    sizes: ['M','L','XL'],     colors: ['Multi'],               image: 'assets/placeholder.jpg' },
  { id: 11, name: 'Slim Fit Chinos',         category: 'men',        price: 140, stock: 'low-stock',   sizes: ['32','34','36'],   colors: ['Khaki','Navy'],        image: 'assets/placeholder.jpg' },
  { id: 12, name: 'Agbada Suit',             category: 'men',        price: 450, stock: 'in-stock',    sizes: ['L','XL','XXL'],   colors: ['White','Gold'],        image: 'assets/placeholder.jpg' },

  // CHILDREN
  { id: 13, name: 'Kids Ankara Dress',       category: 'children',   price: 80,  stock: 'in-stock',    sizes: ['2Y','4Y','6Y'],   colors: ['Yellow','Green'],      image: 'assets/placeholder.jpg' },
  { id: 14, name: 'Boys Kente Shirt',        category: 'children',   price: 70,  stock: 'in-stock',    sizes: ['4Y','6Y','8Y'],   colors: ['Multi'],               image: 'assets/placeholder.jpg' },
  { id: 15, name: 'Girls Party Dress',       category: 'children',   price: 100, stock: 'low-stock',   sizes: ['3Y','5Y','7Y'],   colors: ['Pink','White'],        image: 'assets/placeholder.jpg' },

  // BAGS & SHOES
  { id: 16, name: 'Leopard Print Bag',       category: 'bags-shoes', price: 250, stock: 'in-stock',    sizes: ['One Size'],       colors: ['Brown','Black'],       image: 'assets/placeholder.jpg' },
  { id: 17, name: 'Zebra Print Heels',       category: 'bags-shoes', price: 180, stock: 'in-stock',    sizes: ['37','38','39','40'], colors: ['Black','White'],    image: 'assets/placeholder.jpg' },
  { id: 18, name: 'Office Leather Shoes',    category: 'bags-shoes', price: 220, stock: 'low-stock',   sizes: ['40','41','42'],   colors: ['Black','Brown'],       image: 'assets/placeholder.jpg' },
  { id: 19, name: 'Butterfly Sandals',       category: 'bags-shoes', price: 150, stock: 'in-stock',    sizes: ['36','37','38'],   colors: ['Gold','Silver'],       image: 'assets/placeholder.jpg' },

  // FABRICS
  { id: 20, name: 'Kente Fabric (6 yards)',  category: 'fabrics',    price: 300, stock: 'in-stock',    sizes: ['6 yards'],        colors: ['Multi'],               image: 'assets/placeholder.jpg' },
  { id: 21, name: 'GTP Ankara Print',        category: 'fabrics',    price: 120, stock: 'in-stock',    sizes: ['6 yards'],        colors: ['Blue','Red'],          image: 'assets/placeholder.jpg' },
  { id: 22, name: 'Silk Fabric (per yard)',  category: 'fabrics',    price: 60,  stock: 'low-stock',   sizes: ['Per yard'],       colors: ['White','Cream'],       image: 'assets/placeholder.jpg' },

  // ACCESSORIES
  { id: 23, name: 'Gold Necklace Set',       category: 'accessories', price: 180, stock: 'in-stock',   sizes: ['One Size'],       colors: ['Gold'],                image: 'assets/placeholder.jpg' },
  { id: 24, name: 'Beaded Bracelet',         category: 'accessories', price: 60,  stock: 'in-stock',   sizes: ['One Size'],       colors: ['Multi'],               image: 'assets/placeholder.jpg' },
  { id: 25, name: 'Head Wrap Scarf',         category: 'accessories', price: 50,  stock: 'in-stock',   sizes: ['One Size'],       colors: ['Red','Blue','Green'],  image: 'assets/placeholder.jpg' },
];

let products = JSON.parse(localStorage.getItem('kathyProducts')) || defaultProducts;
let editId = null;

// ===== CATEGORY CONFIG =====
const categories = [
  { key: 'women',      label: "Women's Collection",  icon: 'fa-female' },
  { key: 'men',        label: "Men's Collection",     icon: 'fa-male' },
  { key: 'children',   label: "Children's Collection",icon: 'fa-child' },
  { key: 'bags-shoes', label: "Bags & Shoes",         icon: 'fa-shopping-bag' },
  { key: 'fabrics',    label: "Fabrics",              icon: 'fa-scroll' },
  { key: 'accessories',label: "Accessories",          icon: 'fa-gem' },
];

// ===== SAVE TO LOCALSTORAGE =====
function saveProducts() {
  localStorage.setItem('kathyProducts', JSON.stringify(products));
}

// ===== RENDER ALL PRODUCTS =====
function renderProducts(filter = 'all', search = '', stockFilter = 'all') {
  const container = document.getElementById('productsContainer');
  container.innerHTML = '';

  categories.forEach(cat => {
    if (filter !== 'all' && filter !== cat.key) return;

    let filtered = products.filter(p => p.category === cat.key);

    if (search) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (stockFilter !== 'all') {
      filtered = filtered.filter(p => p.stock === stockFilter);
    }

    if (filtered.length === 0) return;

    // Category heading
    const heading = document.createElement('div');
    heading.className = 'category-heading';
    heading.innerHTML = `
      <i class="fas ${cat.icon}"></i>
      <span>${cat.label}</span>
      <span class="category-count">${filtered.length} item${filtered.length !== 1 ? 's' : ''}</span>
    `;
    container.appendChild(heading);

    // Product grid
    const grid = document.createElement('div');
    grid.className = 'products-grid';

    filtered.forEach(p => {
      const stockClass = p.stock === 'in-stock' ? 'in-stock' : p.stock === 'low-stock' ? 'low-stock' : 'out-of-stock';
      const stockLabel = p.stock.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.id = p.id;
      card.innerHTML = `
        <div class="product-card-img">
          <img src="${p.image}" alt="${p.name}" onerror="this.src='assets/placeholder.jpg'">
          <span class="stock-badge ${stockClass}">${stockLabel}</span>
        </div>
        <div class="product-card-body">
          <h3>${p.name}</h3>
          <p class="product-price">GHC ${parseFloat(p.price).toFixed(2)}</p>
          <p class="product-meta"><i class="fas fa-ruler"></i> ${p.sizes.join(', ')}</p>
          <p class="product-meta"><i class="fas fa-palette"></i> ${p.colors.join(', ')}</p>
        </div>
        <div class="product-card-actions">
          <button class="btn-quickview" data-id="${p.id}" title="Quick View"><i class="fas fa-eye"></i></button>
          <button class="btn-edit" data-id="${p.id}" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn-delete" data-id="${p.id}" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      `;
      grid.appendChild(card);
    });

    container.appendChild(grid);
  });

  attachCardEvents();
}

// ===== ATTACH CARD EVENTS =====
function attachCardEvents() {
  // Quick View
  document.querySelectorAll('.btn-quickview').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = products.find(p => p.id == btn.dataset.id);
      if (!p) return;
      document.getElementById('qvImage').src = p.image;
      document.getElementById('qvName').textContent = p.name;
      document.getElementById('qvPrice').textContent = `GHC ${parseFloat(p.price).toFixed(2)}`;
      document.getElementById('qvStock').textContent = `Stock: ${p.stock.replace(/-/g, ' ')}`;
      document.getElementById('qvSizes').textContent = `Sizes: ${p.sizes.join(', ')}`;
      document.getElementById('qvColors').textContent = `Colors: ${p.colors.join(', ')}`;
      document.getElementById('quickViewOverlay').classList.add('show');
    });
  });

  // Edit
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = products.find(p => p.id == btn.dataset.id);
      if (!p) return;
      editId = p.id;
      document.getElementById('modalTitle').textContent = 'Edit Product';
      document.getElementById('productName').value = p.name;
      document.getElementById('productCategory').value = p.category;
      document.getElementById('productPrice').value = p.price;
      document.getElementById('productStock').value = p.stock;
      document.getElementById('productSizes').value = p.sizes.join(', ');
      document.getElementById('productColors').value = p.colors.join(', ');
      document.getElementById('productImage').value = p.image;
      document.getElementById('productModalOverlay').classList.add('show');
    });
  });

  // Delete
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id != btn.dataset.id);
        saveProducts();
        renderProducts(
          document.getElementById('categoryFilter').value,
          document.getElementById('searchBar').value,
          document.getElementById('stockFilter').value
        );
        showToast('Product deleted successfully!');
      }
    });
  });
}

// ===== ADD PRODUCT BUTTON =====
document.getElementById('addProductBtn').addEventListener('click', () => {
  editId = null;
  document.getElementById('modalTitle').textContent = 'Add New Product';
  document.getElementById('productForm').reset();
  document.getElementById('productModalOverlay').classList.add('show');
});

// ===== CANCEL MODAL =====
document.getElementById('cancelModal').addEventListener('click', () => {
  document.getElementById('productModalOverlay').classList.remove('show');
});

// Close quick view
document.getElementById('closeQuickView').addEventListener('click', () => {
  document.getElementById('quickViewOverlay').classList.remove('show');
});

// Close modals by clicking overlay
document.getElementById('productModalOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('productModalOverlay')) {
    document.getElementById('productModalOverlay').classList.remove('show');
  }
});

document.getElementById('quickViewOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('quickViewOverlay')) {
    document.getElementById('quickViewOverlay').classList.remove('show');
  }
});

// ===== FORM SUBMIT =====
document.getElementById('productForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const name     = document.getElementById('productName').value.trim();
  const category = document.getElementById('productCategory').value;
  const price    = parseFloat(document.getElementById('productPrice').value);
  const stock    = document.getElementById('productStock').value;
  const sizes    = document.getElementById('productSizes').value.split(',').map(s => s.trim()).filter(Boolean);
  const colors   = document.getElementById('productColors').value.split(',').map(c => c.trim()).filter(Boolean);
  const image    = document.getElementById('productImage').value.trim() || 'assets/placeholder.jpg';

  if (editId !== null) {
    const idx = products.findIndex(p => p.id === editId);
    if (idx !== -1) {
      products[idx] = { id: editId, name, category, price, stock, sizes, colors, image };
      showToast('Product updated successfully!');
    }
  } else {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, name, category, price, stock, sizes, colors, image });
    showToast('Product added successfully!');
  }

  saveProducts();
  document.getElementById('productModalOverlay').classList.remove('show');
  renderProducts(
    document.getElementById('categoryFilter').value,
    document.getElementById('searchBar').value,
    document.getElementById('stockFilter').value
  );
});

// ===== FILTERS =====
document.getElementById('searchBar').addEventListener('input', () => {
  renderProducts(
    document.getElementById('categoryFilter').value,
    document.getElementById('searchBar').value,
    document.getElementById('stockFilter').value
  );
});

document.getElementById('categoryFilter').addEventListener('change', () => {
  renderProducts(
    document.getElementById('categoryFilter').value,
    document.getElementById('searchBar').value,
    document.getElementById('stockFilter').value
  );
});

document.getElementById('stockFilter').addEventListener('change', () => {
  renderProducts(
    document.getElementById('categoryFilter').value,
    document.getElementById('searchBar').value,
    document.getElementById('stockFilter').value
  );
});

// ===== TOAST =====
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== INITIAL RENDER =====
renderProducts();