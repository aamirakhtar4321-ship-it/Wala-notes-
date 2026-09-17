/* ==================== NOTES WALLAH SHOP — PART 7 ==================== */

let shopProducts = [];
let shopBanners = [];
let shopFilter = 'all';
let shopSearch = '';
let bannerTimer = null;
let bannerIndex = 0;
let saleConfig = { festivals: [] };

const CAT_LABELS = {
  all: 'All',
  books: 'Books',
  tshirts: 'T-Shirts',
  mugs: 'Cups & Mugs',
  stationery: 'Stationery',
  accessories: 'Accessories'
};

function loadShopPage() {
  const container = document.getElementById('shop-content');
  if (!container) return;

  container.innerHTML = `
    <div id="shop-banner-wrap" class="shop-banner-wrap hidden">
      <div class="shop-banner-track" id="shop-banner-track"></div>
      <div class="shop-banner-dots" id="shop-banner-dots"></div>
    </div>

    <div id="sale-banner" class="sale-banner hidden"></div>

    <div class="shop-header-row">
      <div class="shop-search-wrap">
        <i class="fas fa-search"></i>
        <input type="text" id="shop-search" placeholder="Search products..." oninput="onShopSearch(this.value)">
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

  Promise.all([fetchBanners(), fetchSaleConfig(), fetchProducts()]).then(() => {
    startBannerSlider();
    applySaleUI();
    renderShopProducts();
  });
}

async function fetchBanners() {
  try {
    const snap = await db.collection('shop_banners')
      .where('isActive', '==', true)
      .get();
    shopBanners = [];
    snap.forEach(doc => shopBanners.push({ id: doc.id, ...doc.data() }));
    shopBanners.sort((a, b) => (a.order || 0) - (b.order || 0));
    renderBanners();
  } catch (e) {
    console.error('Banners:', e);
    shopBanners = [];
  }
}

function renderBanners() {
  const wrap = document.getElementById('shop-banner-wrap');
  const track = document.getElementById('shop-banner-track');
  const dots = document.getElementById('shop-banner-dots');
  if (!wrap || !track) return;

  if (!shopBanners.length) {
    wrap.classList.add('hidden');
    return;
  }
  wrap.classList.remove('hidden');
  track.innerHTML = shopBanners.map(b =>
    `<div class="shop-banner-slide">${b.imageUrl
      ? `<img src="${b.imageUrl}" alt="" loading="lazy">`
      : ''}</div>`
  ).join('');
  if (dots) {
    dots.innerHTML = shopBanners.map((_, i) =>
      `<span class="dot ${i === 0 ? 'active' : ''}" data-i="${i}"></span>`
    ).join('');
  }
  bannerIndex = 0;
  track.style.transform = 'translateX(0)';
}

function startBannerSlider() {
  if (bannerTimer) clearInterval(bannerTimer);
  if (shopBanners.length < 2) return;
  bannerTimer = setInterval(() => {
    bannerIndex = (bannerIndex + 1) % shopBanners.length;
    const track = document.getElementById('shop-banner-track');
    if (track) track.style.transform = `translateX(-${bannerIndex * 100}%)`;
    document.querySelectorAll('#shop-banner-dots .dot').forEach((d, i) => {
      d.classList.toggle('active', i === bannerIndex);
    });
  }, 3500);
}

async function fetchSaleConfig() {
  try {
    const doc = await db.collection('app_settings').doc('shop_sales').get();
    if (doc.exists) saleConfig = doc.data() || { festivals: [] };
    else saleConfig = { festivals: [] };
  } catch (e) {
    saleConfig = { festivals: [] };
  }
}

function getActiveSale() {
  const now = new Date();
  const festivals = saleConfig.festivals || [];
  for (const f of festivals) {
    if (!f.start || !f.end || !f.name) continue;
    const start = new Date(f.start);
    const end = new Date(f.end);
    end.setHours(23, 59, 59, 999);
    if (now >= start && now <= end) {
      return { type: 'festival', title: f.name + ' Sale', subtitle: 'Special picks for you' };
    }
  }
  if (now.getDay() === 0) {
    return { type: 'sunday', title: 'Sunday Special Sale', subtitle: 'Handpicked for your study goals' };
  }
  return null;
}

function applySaleUI() {
  const el = document.getElementById('sale-banner');
  if (!el) return;
  const sale = getActiveSale();
  if (!sale) {
    el.classList.add('hidden');
    el.innerHTML = '';
    return;
  }
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="sale-banner-inner">
      <i class="fas fa-bolt"></i>
      <div>
        <strong>${escapeHtml(sale.title)}</strong>
        <span>${escapeHtml(sale.subtitle)}</span>
      </div>
    </div>`;
}

async function fetchProducts() {
  const area = document.getElementById('shop-products-area');
  try {
    const snap = await db.collection('products').where('isActive', '==', true).get();
    shopProducts = [];
    snap.forEach(doc => shopProducts.push({ id: doc.id, ...doc.data() }));
    sortProductsForDisplay();
    renderShopProducts();
  } catch (err) {
    console.error(err);
    if (area) {
      area.innerHTML = `<div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Unable to load products. Please try again.</p>
        <button class="btn btn-primary" style="margin-top:12px;width:auto;padding:10px 20px" onclick="fetchProducts()">Retry</button>
      </div>`;
    }
  }
}

function sortProductsForDisplay() {
  const sale = getActiveSale();
  // Pinned first always (no visual label). Then featured. Then rest.
  shopProducts.sort((a, b) => {
    const pinA = a.isPinned ? 1 : 0;
    const pinB = b.isPinned ? 1 : 0;
    if (pinB !== pinA) return pinB - pinA;
    const featA = a.isFeatured ? 1 : 0;
    const featB = b.isFeatured ? 1 : 0;
    return featB - featA;
  });

  if (sale) {
    // Show 4–5 products: prefer pinned, then random from rest
    const pinned = shopProducts.filter(p => p.isPinned);
    const rest = shopProducts.filter(p => !p.isPinned);
    shuffle(rest);
    const picked = [...pinned, ...rest].slice(0, 5);
    shopProducts = picked.length ? picked : shopProducts;
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

function marketplaceButtonsHtml(p) {
  const buttons = [];
  if (p.flipkartUrl && /^https?:\/\//i.test(p.flipkartUrl)) {
    buttons.push(`<a class="mkt-btn mkt-flipkart" href="${escapeAttr(p.flipkartUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
      <i class="fas fa-shopping-bag"></i> Flipkart</a>`);
  }
  if (p.amazonUrl && /^https?:\/\//i.test(p.amazonUrl)) {
    buttons.push(`<a class="mkt-btn mkt-amazon" href="${escapeAttr(p.amazonUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
      <i class="fab fa-amazon"></i> Amazon</a>`);
  }
  if (p.meeshoUrl && /^https?:\/\//i.test(p.meeshoUrl)) {
    buttons.push(`<a class="mkt-btn mkt-meesho" href="${escapeAttr(p.meeshoUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
      <i class="fas fa-store"></i> Meesho</a>`);
  }
  if (p.otherStoreUrl && /^https?:\/\//i.test(p.otherStoreUrl)) {
    const label = escapeHtml(p.otherStoreName || 'Store');
    buttons.push(`<a class="mkt-btn mkt-other" href="${escapeAttr(p.otherStoreUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
      <i class="fas fa-external-link-alt"></i> ${label}</a>`);
  }
  if (!buttons.length) {
    return `<span class="mkt-none">Links coming soon</span>`;
  }
  return `<div class="mkt-btns">${buttons.join('')}</div>`;
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

  // Re-apply pin sort after filter (no pin label for users)
  list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

  if (!list.length) {
    area.innerHTML = `<div class="empty-state">
      <i class="fas fa-store"></i>
      <p>${shopSearch || shopFilter !== 'all' ? 'No products found' : 'Nothing here yet'}</p>
      <small>Admin can add products from Account → Shop Admin</small>
    </div>`;
    return;
  }

  area.innerHTML = `<div class="product-grid">${list.map(p => `
    <div class="product-card" onclick="openProductDetail('${p.id}')">
      <div class="product-img-wrap">
        ${p.imageUrl
          ? `<img src="${escapeAttr(p.imageUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'img-placeholder\\'><i class=\\'fas fa-image\\'></i></div>'">`
          : `<div class="img-placeholder"><i class="fas fa-image"></i></div>`}
      </div>
      <div class="product-body">
        <p class="product-cat">${escapeHtml(CAT_LABELS[p.category] || p.category || '')}</p>
        <h4 class="product-name">${escapeHtml(p.name || 'Product')}</h4>
        ${marketplaceButtonsHtml(p)}
      </div>
    </div>
  `).join('')}</div>`;
}

function openProductDetail(id) {
  const p = shopProducts.find(x => x.id === id);
  if (!p) return;
  detailQty = 1;
  const container = document.getElementById('shop-content');
  container.innerHTML = `
    <div class="back-bar" onclick="loadShopPage()">
      <i class="fas fa-arrow-left"></i><span>Back</span>
    </div>
    <div class="product-detail">
      <div class="detail-img">
        ${p.imageUrl
          ? `<img src="${escapeAttr(p.imageUrl)}" alt="" loading="lazy">`
          : `<div class="img-placeholder large"><i class="fas fa-image"></i></div>`}
      </div>
      <p class="product-cat">${escapeHtml(CAT_LABELS[p.category] || p.category || '')}</p>
      <h2 class="detail-name">${escapeHtml(p.name || '')}</h2>
      ${p.description ? `<p class="detail-desc">${escapeHtml(p.description)}</p>` : ''}
      <div class="detail-mkt">
        <p class="mkt-label">Available on</p>
        ${marketplaceButtonsHtml(p)}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}
function escapeAttr(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- ADMIN ---------- */
async function isCurrentUserAdmin() {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    const doc = await db.collection('users').doc(user.uid).get();
    return doc.exists && doc.data().isAdmin === true;
  } catch (e) { return false; }
}

async function openShopAdmin() {
  if (!(await isCurrentUserAdmin())) {
    alert('Admin access only');
    return;
  }
  const shopNav = document.querySelector('.nav-item[data-page="shop"]');
  if (shopNav) shopNav.click();
  setTimeout(() => showAdminDashboard(), 120);
}

async function showAdminDashboard() {
  const c = document.getElementById('shop-content');
  if (!c) return;

  let total = 0, active = 0, pinned = 0;
  try {
    const snap = await db.collection('products').get();
    total = snap.size;
    snap.forEach(d => {
      const x = d.data();
      if (x.isActive) active++;
      if (x.isPinned) pinned++;
    });
  } catch (e) {}

  c.innerHTML = `
    <div class="back-bar" onclick="loadShopPage()"><i class="fas fa-arrow-left"></i><span>Shop Admin</span></div>
    <div class="admin-stats">
      <div class="admin-stat"><strong>${total}</strong><span>Total</span></div>
      <div class="admin-stat"><strong>${active}</strong><span>Active</span></div>
      <div class="admin-stat"><strong>${pinned}</strong><span>Pinned</span></div>
    </div>
    <button class="btn btn-primary" onclick="showAdminAddProduct()">Add Product</button>
    <button class="btn btn-outline" style="margin-top:8px" onclick="showAdminBanners()">Manage Banners</button>
    <button class="btn btn-outline" style="margin-top:8px" onclick="showAdminProductList()">All Products</button>
    <p style="font-size:12px;color:var(--text-light);margin-top:16px">
      Pin ON = product always shows first (users never see “Pinned”).
      Festival dates: Firestore → app_settings/shop_sales
    </p>
  `;
}

function showAdminAddProduct(editId, data) {
  const c = document.getElementById('shop-content');
  const d = data || {};
  c.innerHTML = `
    <div class="back-bar" onclick="showAdminDashboard()"><i class="fas fa-arrow-left"></i><span>${editId ? 'Edit' : 'Add'} Product</span></div>
    <div class="admin-form">
      <input type="text" id="ap-name" placeholder="Product name" value="${escapeAttr(d.name || '')}">
      <select id="ap-category">
        ${['books','tshirts','mugs','stationery','accessories'].map(cat =>
          `<option value="${cat}" ${(d.category||'')===cat?'selected':''}>${CAT_LABELS[cat]}</option>`
        ).join('')}
      </select>
      <textarea id="ap-desc" placeholder="Description" rows="2">${escapeHtml(d.description || '')}</textarea>
      <input type="url" id="ap-image" placeholder="Image URL (Firebase Storage)" value="${escapeAttr(d.imageUrl || '')}">
      <input type="url" id="ap-flipkart" placeholder="Flipkart URL (exact)" value="${escapeAttr(d.flipkartUrl || '')}">
      <input type="url" id="ap-amazon" placeholder="Amazon URL (exact)" value="${escapeAttr(d.amazonUrl || '')}">
      <input type="url" id="ap-meesho" placeholder="Meesho URL (exact)" value="${escapeAttr(d.meeshoUrl || '')}">
      <input type="text" id="ap-other-name" placeholder="Other store name (optional)" value="${escapeAttr(d.otherStoreName || '')}">
      <input type="url" id="ap-other-url" placeholder="Other store URL (exact)" value="${escapeAttr(d.otherStoreUrl || '')}">
      <label class="check-label"><input type="checkbox" id="ap-pinned" ${d.isPinned ? 'checked' : ''}> Pin Product (show first)</label>
      <label class="check-label"><input type="checkbox" id="ap-featured" ${d.isFeatured ? 'checked' : ''}> Featured</label>
      <label class="check-label"><input type="checkbox" id="ap-active" ${d.isActive !== false ? 'checked' : ''}> Active</label>
      <button class="btn btn-primary" id="ap-save" onclick="saveAdminProduct('${editId || ''}')">Save Product</button>
    </div>
  `;
}

async function saveAdminProduct(editId) {
  const name = document.getElementById('ap-name').value.trim();
  if (!name) { alert('Name required'); return; }

  const payload = {
    name,
    category: document.getElementById('ap-category').value,
    description: document.getElementById('ap-desc').value.trim(),
    imageUrl: document.getElementById('ap-image').value.trim(),
    flipkartUrl: document.getElementById('ap-flipkart').value.trim(),
    amazonUrl: document.getElementById('ap-amazon').value.trim(),
    meeshoUrl: document.getElementById('ap-meesho').value.trim(),
    otherStoreName: document.getElementById('ap-other-name').value.trim(),
    otherStoreUrl: document.getElementById('ap-other-url').value.trim(),
    isPinned: document.getElementById('ap-pinned').checked,
    isFeatured: document.getElementById('ap-featured').checked,
    isActive: document.getElementById('ap-active').checked,
    stockStatus: 'in_stock',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Validate URLs if present
  for (const key of ['flipkartUrl','amazonUrl','meeshoUrl','otherStoreUrl','imageUrl']) {
    const v = payload[key];
    if (v && !/^https?:\/\//i.test(v)) {
      alert(key + ' must be a full http/https URL');
      return;
    }
  }

  const btn = document.getElementById('ap-save');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    if (editId) {
      await db.collection('products').doc(editId).set(payload, { merge: true });
    } else {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('products').add(payload);
    }
    alert('Saved');
    showAdminDashboard();
  } catch (err) {
    alert('Failed: ' + (err.message || 'Error'));
  }
  btn.disabled = false;
  btn.textContent = 'Save Product';
}

async function showAdminProductList() {
  const c = document.getElementById('shop-content');
  c.innerHTML = `<div class="back-bar" onclick="showAdminDashboard()"><i class="fas fa-arrow-left"></i><span>Products</span></div>
    <div class="empty-state"><i class="fas fa-spinner fa-spin"></i></div>`;
  try {
    const snap = await db.collection('products').get();
    let html = `<div class="back-bar" onclick="showAdminDashboard()"><i class="fas fa-arrow-left"></i><span>Products</span></div>`;
    if (snap.empty) {
      html += `<div class="empty-state"><p>No products yet</p></div>`;
    } else {
      snap.forEach(doc => {
        const p = doc.data();
        html += `<div class="admin-product-row">
          <div>
            <strong>${escapeHtml(p.name)}</strong>
            <small>${p.isActive ? 'Active' : 'Off'} ${p.isPinned ? '· Pin' : ''}</small>
          </div>
          <div>
            <button class="btn-sm btn-outline" onclick='showAdminAddProduct("${doc.id}", ${JSON.stringify(p).replace(/'/g, "&#39;")})'>Edit</button>
            <button class="btn-sm btn-outline" onclick="toggleProductActive('${doc.id}', ${!p.isActive})">${p.isActive ? 'Deactivate' : 'Activate'}</button>
          </div>
        </div>`;
      });
    }
    c.innerHTML = html;
  } catch (e) {
    c.innerHTML = `<div class="back-bar" onclick="showAdminDashboard()"><i class="fas fa-arrow-left"></i><span>Products</span></div>
      <p>Error loading</p>`;
  }
}

async function toggleProductActive(id, active) {
  try {
    await db.collection('products').doc(id).update({
      isActive: active,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showAdminProductList();
  } catch (e) {
    alert('Failed');
  }
}

async function showAdminBanners() {
  const c = document.getElementById('shop-content');
  c.innerHTML = `
    <div class="back-bar" onclick="showAdminDashboard()"><i class="fas fa-arrow-left"></i><span>Banners</span></div>
    <div class="admin-form">
      <input type="url" id="bn-url" placeholder="Banner image URL (Firebase Storage)">
      <input type="number" id="bn-order" placeholder="Order (0,1,2...)" value="0">
      <button class="btn btn-primary" onclick="saveBanner()">Add Banner</button>
    </div>
    <div id="bn-list" style="margin-top:16px"></div>
  `;
  try {
    const snap = await db.collection('shop_banners').get();
    let html = '';
    snap.forEach(doc => {
      const b = doc.data();
      html += `<div class="admin-product-row">
        <small>${escapeHtml(b.imageUrl || '').slice(0, 40)}...</small>
        <button class="btn-sm btn-outline" onclick="deleteBanner('${doc.id}')">Delete</button>
      </div>`;
    });
    document.getElementById('bn-list').innerHTML = html || '<p style="color:var(--text-light);font-size:13px">No banners</p>';
  } catch (e) {}
}

async function saveBanner() {
  const imageUrl = document.getElementById('bn-url').value.tri
