/* ==================== NOTES WALLAH SHOP — PART 8 (Reference UI) ==================== */

let shopProducts = [];
let shopBanners = [];
let shopFilter = 'all';
let shopSearch = '';
let bannerTimer = null;
let bannerIndex = 0;
let saleConfig = { festivals: [] };

const CAT_LABELS = {
  all: 'All', books: 'Books', tshirts: 'T-Shirts', mugs: 'Cups & Mugs',
  stationery: 'Stationery', accessories: 'Accessories'
};
const CAT_ICONS = {
  books: 'fas fa-book', tshirts: 'fas fa-tshirt', mugs: 'fas fa-mug-hot',
  stationery: 'fas fa-pen', accessories: 'fas fa-backpack'
};
const CAT_COLORS = {
  books: '#e3f2fd', tshirts: '#fce4ec', mugs: '#e8f5e9',
  stationery: '#fff3e0', accessories: '#f3e5f5'
};
const CAT_ICON_COLORS = {
  books: '#1976d2', tshirts: '#e91e63', mugs: '#43a047',
  stationery: '#ef6c00', accessories: '#8e24aa'
};

function loadShopPage() {
  const container = document.getElementById('shop-content');
  if (!container) return;

  container.innerHTML = `
    <div id="shop-banner-wrap" class="shop-banner-wrap">
      <div class="shop-hero-card">
        <div class="shop-hero-text">
          <span class="shop-hero-tag"><i class="fas fa-shopping-bag"></i> Notes Wallah Shop</span>
          <h2>Study Smart<br><span>Shop Smart</span></h2>
          <p>Best Books · Premium T-Shirts · Study Accessories</p>
        </div>
        <div class="shop-hero-art"><i class="fas fa-graduation-cap"></i></div>
      </div>
      <div class="shop-banner-track hidden" id="shop-banner-track"></div>
      <div class="shop-banner-dots" id="shop-banner-dots"></div>
    </div>

    <div id="sale-banner" class="sale-banner hidden"></div>

    <div class="shop-search-wrap full">
      <i class="fas fa-search"></i>
      <input type="text" id="shop-search" placeholder="Search products..." oninput="onShopSearch(this.value)">
    </div>

    <div class="shop-section-head">
      <h3>Shop by Category</h3>
    </div>
    <div class="shop-cat-icons" id="shop-cat-icons"></div>

    <div class="shop-section-head">
      <h3><i class="fas fa-star" style="color:var(--gold);font-size:14px"></i> Featured Products</h3>
    </div>
    <div id="shop-products-area">
      <div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>
    </div>
  `;

  renderCatIcons();
  Promise.all([fetchBanners(), fetchSaleConfig(), fetchProducts()]).then(() => {
    startBannerSlider();
    applySaleUI();
    renderShopProducts();
  });
}

function renderCatIcons() {
  const el = document.getElementById('shop-cat-icons');
  if (!el) return;
  const cats = ['books','tshirts','mugs','stationery','accessories'];
  el.innerHTML = cats.map(c => `
    <button class="cat-icon-btn ${shopFilter===c?'active':''}" onclick="setShopFilter('${c}')">
      <span class="cat-icon-circle" style="background:${CAT_COLORS[c]};color:${CAT_ICON_COLORS[c]}">
        <i class="${CAT_ICONS[c]}"></i>
      </span>
      <span class="cat-icon-label">${CAT_LABELS[c]}</span>
    </button>
  `).join('') + `
    <button class="cat-icon-btn ${shopFilter==='all'?'active':''}" onclick="setShopFilter('all')">
      <span class="cat-icon-circle" style="background:#eceff1;color:#546e7a"><i class="fas fa-th"></i></span>
      <span class="cat-icon-label">All</span>
    </button>`;
}

async function fetchBanners() {
  try {
    const snap = await db.collection('shop_banners').where('isActive', '==', true).get();
    shopBanners = [];
    snap.forEach(doc => shopBanners.push({ id: doc.id, ...doc.data() }));
    shopBanners.sort((a, b) => (a.order || 0) - (b.order || 0));
    renderBanners();
  } catch (e) { shopBanners = []; }
}

function renderBanners() {
  const track = document.getElementById('shop-banner-track');
  const dots = document.getElementById('shop-banner-dots');
  const hero = document.querySelector('.shop-hero-card');
  if (!track) return;
  if (!shopBanners.length) {
    track.classList.add('hidden');
    if (hero) hero.classList.remove('hidden');
    return;
  }
  if (hero) hero.classList.add('hidden');
  track.classList.remove('hidden');
  track.innerHTML = shopBanners.map(b =>
    `<div class="shop-banner-slide">${b.imageUrl ? `<img src="${escapeAttr(b.imageUrl)}" alt="" loading="lazy">` : ''}</div>`
  ).join('');
  if (dots) {
    dots.innerHTML = shopBanners.map((_, i) =>
      `<span class="dot ${i===0?'active':''}"></span>`).join('');
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
    document.querySelectorAll('#shop-banner-dots .dot').forEach((d, i) => d.classList.toggle('active', i === bannerIndex));
  }, 4000);
}

async function fetchSaleConfig() {
  try {
    const doc = await db.collection('app_settings').doc('shop_sales').get();
    saleConfig = doc.exists ? (doc.data() || { festivals: [] }) : { festivals: [] };
  } catch (e) { saleConfig = { festivals: [] }; }
}

function getActiveSale() {
  const now = new Date();
  for (const f of (saleConfig.festivals || [])) {
    if (!f.start || !f.end || !f.name) continue;
    const start = new Date(f.start);
    const end = new Date(f.end);
    end.setHours(23, 59, 59, 999);
    if (now >= start && now <= end)
      return { type: 'festival', title: f.name + ' Sale', subtitle: 'Special picks for you' };
  }
  if (now.getDay() === 0)
    return { type: 'sunday', title: 'Sunday Special Sale', subtitle: 'Handpicked for your study goals' };
  return null;
}

function applySaleUI() {
  const el = document.getElementById('sale-banner');
  if (!el) return;
  const sale = getActiveSale();
  if (!sale) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.innerHTML = `<div class="sale-banner-inner"><i class="fas fa-bolt"></i><div>
    <strong>${escapeHtml(sale.title)}</strong><span>${escapeHtml(sale.subtitle)}</span></div></div>`;
}

async function fetchProducts() {
  try {
    const snap = await db.collection('products').where('isActive', '==', true).get();
    shopProducts = [];
    snap.forEach(doc => shopProducts.push({ id: doc.id, ...doc.data() }));
    sortProductsForDisplay();
    renderShopProducts();
  } catch (err) {
    const area = document.getElementById('shop-products-area');
    if (area) area.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i>
      <p>Unable to load products.</p>
      <button class="btn btn-primary" style="margin-top:12px;width:auto;padding:10px 20px" onclick="fetchProducts()">Retry</button></div>`;
  }
}

function sortProductsForDisplay() {
  shopProducts.sort((a, b) => (b.isPinned?1:0)-(a.isPinned?1:0) || (b.isFeatured?1:0)-(a.isFeatured?1:0));
  const sale = getActiveSale();
  if (sale) {
    const pinned = shopProducts.filter(p => p.isPinned);
    const rest = shopProducts.filter(p => !p.isPinned);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    shopProducts = [...pinned, ...rest].slice(0, 5);
  }
}

function onShopSearch(val) {
  shopSearch = (val || '').toLowerCase().trim();
  renderShopProducts();
}

function setShopFilter(cat) {
  shopFilter = cat;
  renderCatIcons();
  renderShopProducts();
}

function marketplaceButtonsHtml(p, large) {
  const buttons = [];
  if (p.flipkartUrl && /^https?:\/\//i.test(p.flipkartUrl)) {
    buttons.push(`<a class="mkt-btn mkt-flipkart ${large?'mkt-lg':''}" href="${escapeAttr(p.flipkartUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
      <span class="mkt-logo">f</span> Flipkart ${large?'<i class="fas fa-arrow-right"></i>':''}</a>`);
  }
  if (p.amazonUrl && /^https?:\/\//i.test(p.amazonUrl)) {
    buttons.push(`<a class="mkt-btn mkt-amazon ${large?'mkt-lg':''}" href="${escapeAttr(p.amazonUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
      amazon ${large?'<i class="fas fa-arrow-right"></i>':''}</a>`);
  }
  if (p.meeshoUrl && /^https?:\/\//i.test(p.meeshoUrl)) {
    buttons.push(`<a class="mkt-btn mkt-meesho ${large?'mkt-lg':''}" href="${escapeAttr(p.meeshoUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
      meesho ${large?'<i class="fas fa-arrow-right"></i>':''}</a>`);
  }
  if (p.otherStoreUrl && /^https?:\/\//i.test(p.otherStoreUrl)) {
    const label = escapeHtml(p.otherStoreName || 'Other Stores');
    buttons.push(`<a class="mkt-btn mkt-other ${large?'mkt-lg':''}" href="${escapeAttr(p.otherStoreUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
      <i class="fas fa-link"></i> ${label} ${large?'<i class="fas fa-arrow-right"></i>':''}</a>`);
  }
  if (!buttons.length) return `<span class="mkt-none">Links coming soon</span>`;
  return `<div class="mkt-btns ${large?'mkt-grid':''}">${buttons.join('')}</div>`;
}

function renderShopProducts() {
  const area = document.getElementById('shop-products-area');
  if (!area) return;

  let list = shopProducts.filter(p => {
    if (shopFilter !== 'all' && (p.category || '').toLowerCase() !== shopFilter) return false;
    if (shopSearch) {
      const n = (p.name || '').toLowerCase();
      const c = (p.category || '').toLowerCase();
      if (!n.includes(shopSearch) && !c.includes(shopSearch)) return false;
    }
    return true;
  });
  list.sort((a, b) => (b.isPinned?1:0)-(a.isPinned?1:0) || (b.isFeatured?1:0)-(a.isFeatured?1:0));

  if (!list.length) {
    area.innerHTML = `<div class="empty-state"><i class="fas fa-store"></i>
      <p>${shopSearch || shopFilter!=='all' ? 'No products found' : 'Nothing here yet'}</p>
      <small>Admin → Account → Shop Admin</small></div>`;
    return;
  }

  area.innerHTML = `<div class="product-grid">${list.map(p => `
    <div class="product-card ref-card" onclick="openProductDetail('${p.id}')">
      <div class="product-img-wrap">
        ${p.imageUrl
          ? `<img src="${escapeAttr(p.imageUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'img-placeholder\\'><i class=\\'fas fa-image\\'></i></div>'">`
          : `<div class="img-placeholder"><i class="fas fa-image"></i></div>`}
        ${p.isFeatured ? '<span class="feat-badge">Featured</span>' : ''}
      </div>
      <div class="product-body">
        <h4 class="product-name">${escapeHtml(p.name || 'Product')}</h4>
        <p class="product-meta">${escapeHtml(CAT_LABELS[p.category] || p.category || '')}</p>
        ${p.description ? `<p class="product-snippet">${escapeHtml(p.description).slice(0, 80)}${(p.description||'').length>80?'…':''}</p>` : ''}
        ${marketplaceButtonsHtml(p, false)}
      </div>
    </div>
  `).join('')}</div>`;
}

function openProductDetail(id) {
  const p = shopProducts.find(x => x.id === id);
  if (!p) return;
  const container = document.getElementById('shop-content');
  container.innerHTML = `
    <div class="back-bar" onclick="loadShopPage()"><i class="fas fa-arrow-left"></i><span>Product</span></div>
    <div class="product-detail ref-detail">
      <div class="detail-img">
        ${p.imageUrl ? `<img src="${escapeAttr(p.imageUrl)}" alt="" loading="lazy">` : `<div class="img-placeholder large"><i class="fas fa-image"></i></div>`}
        ${p.isFeatured ? '<span class="feat-badge">Featured</span>' : ''}
      </div>
      <span class="chip-cat">${escapeHtml(CAT_LABELS[p.category] || '')}</span>
      <h2 class="detail-name">${escapeHtml(p.name || '')}</h2>
      ${p.description ? `<p class="detail-desc">${escapeHtml(p.description)}</p>` : ''}

      <div class="available-on">
        <h4><i class="fas fa-store"></i> Available On</h4>
        <p class="avail-sub">Choose your preferred marketplace</p>
        ${marketplaceButtonsHtml(p, true)}
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

/* ---------- ADMIN (reference-style) ---------- */
async function isCurrentUserAdmin() {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    const doc = await db.collection("users").doc(user.uid).get();
    if (!doc.exists) return false;
    const v = doc.data().isAdmin;
    return v === true || v === "true" || v === 1 || v === "1";
  } catch (e) {
    console.error("isAdmin error", e);
    return false;
  }
}

async function openShopAdmin() {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert("Pehle login karo");
      return;
    }

    let ok = false;
    let detail = "";
    try {
      const doc = await db.collection("users").doc(user.uid).get();
      if (!doc.exists) {
        detail = "users collection me aapka document nahi mila.\\nUID: " + user.uid;
      } else {
        const data = doc.data();
        const v = data.isAdmin;
        ok = v === true || v === "true" || v === 1 || v === "1";
        detail = "isAdmin value = " + JSON.stringify(v) + " (type: " + typeof v + ")\\nUID: " + user.uid;
      }
    } catch (e) {
      detail = "Firestore read failed: " + (e.message || e.code || e);
    }

    if (!ok) {
      alert("Shop Admin only for admin.\\n\\n" + detail + "\\n\\nFirebase → Firestore → users → apna doc →\\nisAdmin = true (boolean) add karo, phir logout/login.");
      return;
    }

    // Go to shop page then show admin
    const shopNav = document.querySelector('.nav-item[data-page="shop"]');
    const shopPage = document.getElementById("page-shop");
    const shopContent = document.getElementById("shop-content");

    if (shopNav) {
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      shopNav.classList.add("active");
    }
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    if (shopPage) shopPage.classList.add("active");

    if (shopContent) {
      showAdminDashboard();
    } else {
      alert("Shop page not found in HTML. Part 6/8 index.html upload karo.");
    }
  } catch (err) {
    console.error(err);
    alert("Shop Admin error: " + (err.message || err));
  }
}

async function showAdminDashboard() {
  const c = document.getElementById('shop-content');
  if (!c) return;
  let total = 0, active = 0, pinned = 0;
  try {
    const snap = await db.collection('products').get();
    total = snap.size;
    snap.forEach(d => { const x = d.data(); if (x.isActive) active++; if (x.isPinned) pinned++; });
  } catch (e) {}

  c.innerHTML = `
    <div class="back-bar" onclick="loadShopPage()"><i class="fas fa-arrow-left"></i><span>Products</span></div>
    <div class="admin-top-row">
      <h3 style="margin:0">Product catalogue</h3>
      <button class="btn-add-prod" onclick="showAdminAddProduct()"><i class="fas fa-plus"></i> Add product</button>
    </div>
    <div class="admin-stats">
      <div class="admin-stat"><strong>${total}</strong><span>Total</span></div>
      <div class="admin-stat"><strong>${active}</strong><span>Active</span></div>
      <div class="admin-stat"><strong>${pinned}</strong><span>Pinned</span></div>
    </div>
    <button class="btn btn-outline" onclick="showAdminProductList()">Manage products</button>
    <button class="btn btn-outline" style="margin-top:8px" onclick="showAdminBanners()">Manage banners</button>
  `;
}

function showAdminAddProduct(editId, data) {
  const c = document.getElementById('shop-content');
  const d = data || {};
  c.innerHTML = `
    <div class="back-bar" onclick="showAdminDashboard()"><i class="fas fa-arrow-left"></i><span>${editId?'Edit':'Add'} Product</span></div>
    <div class="admin-form card-form">
      <label class="field-label">Name</label>
      <input type="text" id="ap-name" value="${escapeAttr(d.name||'')}" placeholder="Product name">
      <label class="field-label">Category</label>
      <select id="ap-category">
        ${['books','tshirts','mugs','stationery','accessories'].map(cat =>
          `<option value="${cat}" ${(d.category||'')===cat?'selected':''}>${CAT_LABELS[cat]}</option>`).join('')}
      </select>
      <label class="field-label">Description</label>
      <textarea id="ap-desc" rows="3" placeholder="Description">${escapeHtml(d.description||'')}</textarea>
      <label class="field-label">Product image</label>
      <div class="img-upload-row">
        <input type="file" id="ap-image-file" accept="image/*" style="font-size:13px">
        <button type="button" class="btn-sm btn-outline" onclick="uploadProductImage()">Upload</button>
      </div>
      <input type="url" id="ap-image" value="${escapeAttr(d.imageUrl||'')}" placeholder="Or paste image URL">
      <p id="ap-upload-status" style="font-size:12px;color:var(--text-light);margin:4px 0 0"></p>
      <label class="field-label">Flipkart URL</label>
      <input type="url" id="ap-flipkart" value="${escapeAttr(d.flipkartUrl||'')}" placeholder="https://...">
      <label class="field-label">Amazon URL</label>
      <input type="url" id="ap-amazon" value="${escapeAttr(d.amazonUrl||'')}" placeholder="https://...">
      <label class="field-label">Meesho URL</label>
      <input type="url" id="ap-meesho" value="${escapeAttr(d.meeshoUrl||'')}" placeholder="https://...">
      <div class="two-col">
        <div><label class="field-label">Other store name</label>
        <input type="text" id="ap-other-name" value="${escapeAttr(d.otherStoreName||'')}"></div>
        <div><label class="field-label">Other store URL</label>
        <input type="url" id="ap-other-url" value="${escapeAttr(d.otherStoreUrl||'')}"></div>
      </div>
      <div class="toggle-rows">
        <label class="toggle-row"><span>Featured</span><input type="checkbox" id="ap-featured" ${d.isFeatured?'checked':''}></label>
        <label class="toggle-row"><span>Pinned</span><input type="checkbox" id="ap-pinned" ${d.isPinned?'checked':''}></label>
        <label class="toggle-row"><span>Active</span><input type="checkbox" id="ap-active" ${d.isActive!==false?'checked':''}></label>
      </div>
      <button class="btn btn-primary dark-btn" id="ap-save" onclick="saveAdminProduct('${editId||''}')">Save changes</button>
    </div>
  `;
}

async function uploadProductImage() {
  const fileInput = document.getElementById('ap-image-file');
  const status = document.getElementById('ap-upload-status');
  const urlInput = document.getElementById('ap-image');
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    alert('Choose an image first');
    return;
  }
  if (status) status.textContent = 'Uploading to Supabase Storage...';
  try {
    const url = await uploadShopImage(fileInput.files[0], 'products');
    if (urlInput) urlInput.value = url;
    if (status) status.textContent = 'Uploaded successfully';
  } catch (err) {
    console.error(err);
    if (status) status.textContent = 'Upload failed';
    alert((err && err.message) ? err.message : 'Upload failed. Set Supabase keys and create public bucket "shop".');
  }
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
    isPinned: 
