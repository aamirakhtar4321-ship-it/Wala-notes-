/* ==================== NOTES WALLAH - SHOP ==================== */

let shopProducts = [];
let shopCart = JSON.parse(localStorage.getItem('nw_cart') || '[]');
let shopFilter = 'all';
let shopSearch = '';

const SHOP_CATEGORIES = ['all', 'books', 'tshirts', 'mugs', 'stationery', 'accessories'];

function loadShopPage() {
  const container = document.getElementById('shop-content');
  if (!container) return;

  container.innerHTML = `
    <div class="shop-header-row">
      <div class="shop-search-wrap">
        <i class="fas fa-search"></i>
        <input type="text" id="shop-search" placeholder="Search products..." oninput="onShopSearch(this.value)">
      </div>
      <div class="cart-btn" onclick="openCart()">
        <i class="fas fa-shopping-cart"></i>
        <span id="cart-badge" class="cart-badge ${shopCart.length ? '' : 'hidden'}">${shopCart.length}</span>
      </div>
    </div>

    <div class="shop-categories" id="shop-categories">
      <button class="cat-chip active" data-cat="all" onclick="setShopFilter('all')">All</button>
      <button class="cat-chip" data-cat="books" onclick="setShopFilter('books')">Books</button>
      <button class="cat-chip" data-cat="tshirts" onclick="setShopFilter('tshirts')">T-Shirts</button>
      <button class="cat-chip" data-cat="mugs" onclick="setShopFilter('mugs')">Cups & Mugs</button>
      <button class="cat-chip" data-cat="stationery" onclick="setShopFilter('stationery')">Stationery</button>
      <button class="cat-chip" data-cat="accessories" onclick="setShopFilter('accessories')">Accessories</button>
    </div>

    <div id="shop-products-area">
      <div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading products...</p></div>
    </div>
  `;

  fetchProducts();
}

async function fetchProducts() {
  const area = document.getElementById('shop-products-area');
  if (!area) return;

  try {
    const snap = await db.collection('products')
      .where('isActive', '==', true)
      .get();

    shopProducts = [];
    snap.forEach(doc => {
      shopProducts.push({ id: doc.id, ...doc.data() });
    });

    // Sort featured first
    shopProducts.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    renderShopProducts();
  } catch (err) {
    console.error('Shop load error:', err);
    area.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Unable to load products. Please try again.</p>
        <button class="btn btn-primary" style="margin-top:12px;width:auto;padding:10px 20px" onclick="fetchProducts()">Retry</button>
      </div>`;
  }
}

function onShopSearch(val) {
  shopSearch = (val || '').toLowerCase().trim();
  renderShopProducts();
}

function setShopFilter(cat) {
  shopFilter = cat;
  document.querySelectorAll('.cat-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.cat === cat);
  });
  renderShopProducts();
}

function renderShopProducts() {
  const area = document.getElementById('shop-products-area');
  if (!area) return;

  let list = shopProducts.filter(p => {
    if (shopFilter !== 'all' && (p.category || '').toLowerCase() !== shopFilter) return false;
    if (shopSearch) {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      if (!name.includes(shopSearch) && !cat.includes(shopSearch)) return false;
    }
    return true;
  });

  if (list.length === 0) {
    area.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-store"></i>
        <p>${shopSearch || shopFilter !== 'all' ? 'No products found' : 'Nothing here yet'}</p>
        <small>Admin can add products from Account → Shop Admin</small>
      </div>`;
    return;
  }

  let html = '<div class="product-grid">';
  list.forEach(p => {
    const price = Number(p.price) || 0;
    const original = Number(p.originalPrice) || 0;
    const discount = original > price && original > 0
      ? Math.round(((original - price) / original) * 100)
      : (p.discount || 0);

    html += `
      <div class="product-card" onclick="openProductDetail('${p.id}')">
        <div class="product-img-wrap">
          ${p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'img-placeholder\\'><i class=\\'fas fa-image\\'></i></div>'">`
            : `<div class="img-placeholder"><i class="fas fa-image"></i></div>`}
          ${discount ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
        </div>
        <div class="product-body">
          <h4 class="product-name">${escapeHtml(p.name || 'Product')}</h4>
          <div class="product-price-row">
            <span class="price">₹${price}</span>
            ${original > price ? `<span class="original-price">₹${original}</span>` : ''}
          </div>
          ${p.rating ? `<div class="product-rating"><i class="fas fa-star"></i> ${p.rating}</div>` : ''}
          <div class="product-actions" onclick="event.stopPropagation()">
            <button class="btn-sm btn-outline" onclick="addToCart('${p.id}')">Add</button>
            <button class="btn-sm btn-primary" onclick="buyNow('${p.id}')">Buy Now</button>
          </div>
        </div>
      </div>`;
  });
  html += '</div>';
  area.innerHTML = html;
  updateCartBadge();
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function openProductDetail(id) {
  const p = shopProducts.find(x => x.id === id);
  if (!p) return;

  const container = document.getElementById('shop-content');
  const price = Number(p.price) || 0;
  const original = Number(p.originalPrice) || 0;
  const discount = original > price && original > 0
    ? Math.round(((original - price) / original) * 100)
    : (p.discount || 0);

  const buyUrl = p.productType === 'affiliate' ? (p.affiliateUrl || '') : (p.storeUrl || '');
  const canBuy = buyUrl && /^https?:\/\//i.test(buyUrl);

  container.innerHTML = `
    <div class="back-bar" onclick="loadShopPage()">
      <i class="fas fa-arrow-left"></i>
      <span>Back</span>
    </div>

    <div class="product-detail">
      <div class="detail-img">
        ${p.imageUrl
          ? `<img src="${p.imageUrl}" alt="${escapeHtml(p.name)}" loading="lazy">`
          : `<div class="img-placeholder large"><i class="fas fa-image"></i></div>`}
      </div>

      <h2 class="detail-name">${escapeHtml(p.name || '')}</h2>
      <div class="product-price-row" style="margin:8px 0 12px">
        <span class="price" style="font-size:20px">₹${price}</span>
        ${original > price ? `<span class="original-price">₹${original}</span>` : ''}
        ${discount ? `<span class="discount-badge inline">${discount}% OFF</span>` : ''}
      </div>

      ${p.stockStatus === 'out_of_stock' ? '<p class="stock-out">Out of stock</p>' : '<p class="stock-in">In stock</p>'}

      ${p.description ? `<p class="detail-desc">${escapeHtml(p.description)}</p>` : ''}

      <div class="qty-row">
        <span>Quantity</span>
        <div class="qty-controls">
          <button onclick="changeDetailQty(-1)">−</button>
          <span id="detail-qty">1</span>
          <button onclick="changeDetailQty(1)">+</button>
        </div>
      </div>

      <div class="detail-actions">
        <button class="btn btn-outline" onclick="addToCart('${p.id}', getDetailQty())">Add to Cart</button>
        <button class="btn btn-primary" ${canBuy ? '' : 'disabled'} onclick="buyNow('${p.id}')">
          ${canBuy ? 'Buy Now' : 'Link not available'}
        </button>
      </div>
    </div>
  `;
}

let detailQty = 1;
function changeDetailQty(d) {
  detailQty = Math.max(1, detailQty + d);
  const el = document.getElementById('detail-qty');
  if (el) el.textContent = detailQty;
}
function getDetailQty() { return detailQty; }

function addToCart(id, qty = 1) {
  const p = shopProducts.find(x => x.id === id);
  if (!p) return;
  const existing = shopCart.find(c => c.id === id);
  if (existing) existing.qty += qty;
  else shopCart.push({ id, name: p.name, price: p.price, imageUrl: p.imageUrl || '', qty });
  localStorage.setItem('nw_cart', JSON.stringify(shopCart));
  updateCartBadge();
  alert('Added to cart');
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const total = shopCart.reduce((s, c) => s + c.qty, 0);
  badge.textContent = total;
  badge.classList.toggle('hidden', total === 0);
}

function openCart() {
  const container = document.getElementById('shop-content');
  if (!shopCart.length) {
    container.innerHTML = `
      <div class="back-bar" onclick="loadShopPage()"><i class="fas fa-arrow-left"></i><span>Cart</span></div>
      <div class="empty-state"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p></div>`;
    return;
  }

  let total = 0;
  let items = '';
  shopCart.forEach((c, i) => {
    const line = (Number(c.price) || 0) * c.qty;
    total += line;
    items += `
      <div class="cart-item">
        <div class="cart-item-img">
          ${c.imageUrl ? `<img src="${c.imageUrl}" loading="lazy">` : '<i class="fas fa-image"></i>'}
        </div>
        <div class="cart-item-info">
          <h4>${escapeHtml(c.name)}</h4>
          <p>₹${c.price} × ${c.qty}</p>
        </div>
        <div class="cart-item-actions">
          <button onclick="cartQty(${i}, -1)">−</button>
          <span>${c.qty}</span>
          <button onclick="cartQty(${i}, 1)">+</button>
          <button class="remove" onclick="cartRemove(${i})"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
  });

  container.innerHTML = `
    <div class="back-bar" onclick="loadShopPage()"><i class="fas fa-arrow-left"></i><span>Cart</span></div>
    <div class="cart-list">${items}</div>
    <div class="cart-summary card">
      <div class="cart-total-row"><span>Total</span><strong>₹${total}</strong></div>
      <button class="btn btn-primary" style="margin-top:12px" onclick="checkoutCart()">Checkout</button>
      <button class="btn btn-outline" style="margin-top:8px" onclick="loadShopPage()">Continue Shopping</button>
    </div>
  `;
}

function cartQty(i, d) {
  shopCart[i].qty = Math.max(1, shopCart[i].qty + d);
  localStorage.setItem('nw_cart', JSON.stringify(shopCart));
  openCart();
  updateCartBadge();
}
function cartRemove(i) {
  shopCart.splice(i, 1);
  localStorage.setItem('nw_cart', JSON.stringify(shopCart));
  openCart();
  updateCartBadge();
}

function buyNow(id) {
  const p = shopProducts.find(x => x.id === id);
  if (!p) return;
  let url = '';
  if (p.productType === 'affiliate') url = p.affiliateUrl || '';
  else url = p.storeUrl || '';

  if (!url || !/^https?:\/\//i.test(url)) {
    alert('Purchase link is not available for this product.');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

function checkoutCart() {
  if (!shopCart.length) return;
  // Open first product's buy link (affiliate/own store). No fake payment.
  const first = shopProducts.find(p => p.id === shopCart[0].id);
  if (first) buyNow(first.id);
  else alert('Unable to checkout. Product link missing.');
}

// Admin: simple product add (visible only if user is admin)
async function isCurrentUserAdmin() {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    const doc = await db.collection('users').doc(user.uid).get();
    return doc.exists && doc.data().isAdmin === true;
  } catch (e) {
    return false;
  }
}

async function openShopAdmin() {
  const ok = await isCurrentUserAdmin();
  if (!ok) {
    alert('Admin access only');
    return;
  }

  const container = document.getElementById('shop-content') || document.getElementById('page-account');
  // Prefer shop page area; if from account, switch to shop first
  const shopNav = document.querySelector('.nav-item[data-page="shop"]');
  if (shopNav) shopNav.click();

  setTimeout(() => {
    const c = document.getElementById('shop-content');
    if (!c) return;
    c.innerHTML = `
      <div class="back-bar" onclick="loadShopPage()"><i class="fas fa-arrow-left"></i><span>Shop Admin</span></div>
      <h3 style="margin-bottom:12px">Add Product</h3>
      <div class="admin-form">
        <input type="text" id="ap-name" placeholder="Product name">
        <select id="ap-category">
          <option value="books">Books</option>
          <option value="tshirts">T-Shirts</option>
          <option value="mugs">Cups & Mugs</option>
          <option value="stationery">Stationery</option>
          <option value="accessories">Accessories</option>
        </select>
        <textarea id="ap-desc" placeholder="Description" rows="2"></textarea>
        <input type="number" id="ap-price" placeholder="Price (₹)">
        <input type="number" id="ap-original" placeholder="Original price (optional)">
        <select id="ap-type" onchange="toggleAdminUrlFields()">
          <option value="affiliate">Affiliate (Flipkart etc.)</option>
          <option value="own_store">Own Store</option>
        </select>
        <input type="url" id="ap-affiliate" placeholder="Exact Affiliate URL">
        <input type="url" id="ap-store" placeholder="Exact Store URL" class="hidden">
        <input type="url" id="ap-image" placeholder="Image URL (Firebase Storage link)">
        <label class="check-label"><input type="checkbox" id="ap-featured"> Featured</label>
        <button class="btn btn-primary" id="ap-save" onclick="saveAdminProduct()">Save Product</button>
      </div>
      <p style="font-size:12px;color:var(--text-light);margin-top:12px">
        Tip: Upload image to Firebase Storage → shop/products/ → copy download URL here.
        Never invent affiliate links.
      </p>
    `;
    toggleAdminUrlFields();
  }, 100);
}

function toggleAdminUrlFields() {
  const type = document.getElementById('ap-type')?.value;
  const aff = document.getElementById('ap-affiliate');
  const store = document.getElementById('ap-store');
  if (!aff || !store) return;
  if (type === 'affiliate') {
    aff.classList.remove('hidden');
    store.classList.add('hidden');
  } else {
    aff.classList.add('hidden');
    store.classList.remove('hidden');
  }
}

async function saveAdminProduct() {
  const name = document.getElementById('ap-name').value.trim();
  const category = document.getElementById('ap-category').value;
  const description = document.getElementById('ap-desc').value.trim();
  const price = Number(document.getElementById('ap-price').value) || 0;
  const originalPrice = Number(document.getElementById('ap-original').value) || 0;
  const productType = document.getElementById('ap-type').value;
  const affiliateUrl = document.getElementById('ap-affiliate').value.trim();
  const storeUrl = document.getElementById('ap-store').value.trim();
  const imageUrl = document.getElementById('ap-image').value.trim();
  const isFeatured = document.getElementById('ap-featured').checked;

  if (!name || !price) {
    alert('Name and price are required');
    return;
  }
  if (productType === 'affiliate' && affiliateUrl && !/^https?:\/\//i.test(affiliateUrl)) {
    alert('Affiliate URL must start with http:// or https://');
    return;
  }
  if (productType === 'own_store' && storeUrl && !/^https?:\/\//i.test(storeUrl)) {
    alert('Store URL must start with http:// or https://');
    return;
  }

  const btn = document.getElementById('ap-save');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    await db.collection('products').add({
      name,
      category,
      description,
      price,
      originalPrice,
      discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
      productType,
      affiliateUrl: productType === 'affiliate' ? affiliateUrl : '',
      storeUrl: productType === 'own_store' ? storeUrl : '',
      imageUrl: imageUrl || '',
      gallery: [],
      rating: null,
      stockStatus: 'in_stock',
      isFeatured,
      isActive: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('Product saved! It will appear in Shop.');
    loadShopPage();
  } catch (err) {
    console.error(err);
    alert('Failed to save: ' + (err.message || 'Error'));
  }
  btn.disabled = false;
  btn.textContent = 'Save Product';
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav-item[data-page="shop"]');
  if (nav) {
    nav.addEventListener('click', () => setTimeout(loadShopPage, 50));
  }
});
