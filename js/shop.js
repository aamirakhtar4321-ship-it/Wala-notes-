/* ==================== SHOP — SUPABASE ==================== */

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
    <div class="shop-section-head"><h3>Shop by Category</h3></div>
    <div class="shop-cat-icons" id="shop-cat-icons"></div>
    <div class="shop-section-head"><h3><i class="fas fa-star" style="color:#f5a623;font-size:14px"></i> Featured Products</h3></div>
    <div id="shop-products-area"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div></div>
  `;
  renderCatIcons();
  Promise.all([fetchBanners(), fetchSaleConfig(), fetchProducts()]).then(() => {
    startBannerSlider(); applySaleUI(); renderShopProducts();
  });
}

function renderCatIcons() {
  const el = document.getElementById('shop-cat-icons');
  if (!el) return;
  const cats = ['books','tshirts','mugs','stationery','accessories'];
  el.innerHTML = cats.map(c => `
    <button class="cat-icon-btn ${shopFilter===c?'active':''}" onclick="setShopFilter('${c}')">
      <span class="cat-icon-circle" style="background:${CAT_COLORS[c]};color:${CAT_ICON_COLORS[c]}"><i class="${CAT_ICONS[c]}"></i></span>
      <span class="cat-icon-label">${CAT_LABELS[c]}</span>
    </button>`).join('') + `
    <button class="cat-icon-btn ${shopFilter==='all'?'active':''}" onclick="setShopFilter('all')">
      <span class="cat-icon-circle" style="background:#eceff1;color:#546e7a"><i class="fas fa-th"></i></span>
      <span class="cat-icon-label">All</span>
    </button>`;
}

async function fetchBanners() {
  try {
    const { data, error } = await window.sb.from('shop_banners').select('*').eq('is_active', true).order('sort_order');
    if (error) throw error;
    shopBanners = data || [];
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
    `<div class="shop-banner-slide">${b.image_url ? `<img src="${esc(b.image_url)}" loading="lazy">` : ''}</div>`
  ).join('');
  if (dots) dots.innerHTML = shopBanners.map((_, i) => `<span class="dot ${i===0?'active':''}"></span>`).join('');
  bannerIndex = 0; track.style.transform = 'translateX(0)';
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
    const { data } = await window.sb.from('app_settings').select('*').eq('id', 'shop_sales').maybeSingle();
    saleConfig = data?.value || { festivals: [] };
  } catch (e) { saleConfig = { festivals: [] }; }
}

function getActiveSale() {
  const now = new Date();
  for (const f of (saleConfig.festivals || [])) {
    if (!f.start || !f.end || !f.name) continue;
    const start = new Date(f.start), end = new Date(f.end);
    end.setHours(23,59,59,999);
    if (now >= start && now <= end) return { title: f.name + ' Sale', subtitle: 'Special picks for you' };
  }
  if (now.getDay() === 0) return { title: 'Sunday Special Sale', subtitle: 'Handpicked for study goals' };
  return null;
}

function applySaleUI() {
  const el = document.getElementById('sale-banner');
  if (!el) return;
  const sale = getActiveSale();
  if (!sale) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.innerHTML = `<div class="sale-banner-inner"><i class="fas fa-bolt"></i><div><strong>${escHtml(sale.title)}</strong><span>${escHtml(sale.subtitle)}</span></div></div>`;
}

async function fetchProducts() {
  try {
    const { data, error } = await window.sb.from('products').select('*').eq('is_active', true);
    if (error) throw error;
    shopProducts = data || [];
    sortProducts();
    renderShopProducts();
  } catch (err) {
    const area = document.getElementById('shop-products-area');
    if (area) area.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i>
      <p>Unable to load products</p>
      <button class="btn btn-primary" style="margin-top:12px;width:auto;padding:10px 20px" onclick="fetchProducts()">Retry</button></div>`;
  }
}

function sortProducts() {
  shopProducts.sort((a,b) => (b.is_pinned?1:0)-(a.is_pinned?1:0) || (b.is_featured?1:0)-(a.is_featured?1:0));
  if (getActiveSale()) {
    const pinned = shopProducts.filter(p => p.is_pinned);
    const rest = shopProducts.filter(p => !p.is_pinned);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    shopProducts = [...pinned, ...rest].slice(0, 5);
  }
}

function onShopSearch(v) { shopSearch = (v||'').toLowerCase().trim(); renderShopProducts(); }
function setShopFilter(c) { shopFilter = c; renderCatIcons(); renderShopProducts(); }

function mktBtns(p, large) {
  const b = [];
  if (p.flipkart_url && /^https?:\/\//i.test(p.flipkart_url))
    b.push(`<a class="mkt-btn mkt-flipkart ${large?'mkt-lg':''}" href="${esc(p.flipkart_url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><span class="mkt-logo">f</span> Flipkart ${large?'<i class="fas fa-arrow-right"></i>':''}</a>`);
  if (p.amazon_url && /^https?:\/\//i.test(p.amazon_url))
    b.push(`<a class="mkt-btn mkt-amazon ${large?'mkt-lg':''}" href="${esc(p.amazon_url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">amazon ${large?'<i class="fas fa-arrow-right"></i>':''}</a>`);
  if (p.meesho_url && /^https?:\/\//i.test(p.meesho_url))
    b.push(`<a class="mkt-btn mkt-meesho ${large?'mkt-lg':''}" href="${esc(p.meesho_url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">meesho ${large?'<i class="fas fa-arrow-right"></i>':''}</a>`);
  if (p.other_store_url && /^https?:\/\//i.test(p.other_store_url))
    b.push(`<a class="mkt-btn mkt-other ${large?'mkt-lg':''}" href="${esc(p.other_store_url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><i class="fas fa-link"></i> ${escHtml(p.other_store_name||'Other')} ${large?'<i class="fas fa-arrow-right"></i>':''}</a>`);
  if (!b.length) return `<span class="mkt-none">Links coming soon</span>`;
  return `<div class="mkt-btns ${large?'mkt-grid':''}">${b.join('')}</div>`;
}

function renderShopProducts() {
  const area = document.getElementById('shop-products-area');
  if (!area) return;
  let list = shopProducts.filter(p => {
    if (shopFilter !== 'all' && (p.category||'').toLowerCase() !== shopFilter) return false;
    if (shopSearch) {
      const n = (p.name||'').toLowerCase(), c = (p.category||'').toLowerCase();
      if (!n.includes(shopSearch) && !c.includes(shopSearch)) return false;
    }
    return true;
  });
  list.sort((a,b) => (b.is_pinned?1:0)-(a.is_pinned?1:0) || (b.is_featured?1:0)-(a.is_featured?1:0));
  if (!list.length) {
    area.innerHTML = `<div class="empty-state"><i class="fas fa-store"></i>
      <p>${shopSearch||shopFilter!=='all'?'No products found':'Nothing here yet'}</p>
      <small>Admin → Account → Shop Admin</small></div>`;
    return;
  }
  area.innerHTML = `<div class="product-grid">${list.map(p => `
    <div class="product-card ref-card" onclick="openProductDetail('${p.id}')">
      <div class="product-img-wrap">
        ${p.image_url ? `<img src="${esc(p.image_url)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'img-placeholder\\'><i class=\\'fas fa-image\\'></i></div>'">` : `<div class="img-placeholder"><i class="fas fa-image"></i></div>`}
        ${p.is_featured ? '<span class="feat-badge">Featured</span>' : ''}
      </div>
      <div class="product-body">
        <h4 class="product-name">${escHtml(p.name||'Product')}</h4>
        <p class="product-meta">${escHtml(CAT_LABELS[p.category]||p.category||'')}</p>
        ${mktBtns(p,false)}
      </div>
    </div>`).join('')}</div>`;
}

function openProductDetail(id) {
  const p = shopProducts.find(x => x.id === id);
  if (!p) return;
  document.getElementById('shop-content').innerHTML = `
    <div class="back-bar" onclick="loadShopPage()"><i class="fas fa-arrow-left"></i><span>Product</span></div>
    <div class="product-detail ref-detail">
      <div class="detail-img">
        ${p.image_url ? `<img src="${esc(p.image_url)}" loading="lazy">` : `<div class="img-placeholder large"><i class="fas fa-image"></i></div>`}
        ${p.is_featured ? '<span class="feat-badge">Featured</span>' : ''}
      </div>
      <span class="chip-cat">${escHtml(CAT_LABELS[p.category]||'')}</span>
      <h2 class="detail-name">${escHtml(p.name||'')}</h2>
      ${p.description ? `<p class="detail-desc">${escHtml(p.description)}</p>` : ''}
      <div class="available-on">
        <h4><i class="fas fa-store"></i> Available On</h4>
        <p class="avail-sub">Choose your preferred marketplace</p>
        ${mktBtns(p, true)}
      </div>
    </div>`;
}

function esc(s) { return String(s||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escHtml(s) { const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }

/* ---- ADMIN ---- */
function isAdminUser() {
  return !!(AppState && AppState.isAdmin);
}

async function openShopAdmin() {
  if (!isAdminUser()) {
    const email = AppState?.user?.email || '';
    alert('Admin only.\\n\\nLogin with admin account.\\nEmail: ' + email + '\\n\\nSupabase → profiles → is_admin = true');
    return;
  }
  const shopNav = document.querySelector('.nav-item[data-page="shop"]');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (shopNav) shopNav.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-shop')?.classList.add('active');
  setTimeout(() => showAdminDashboard(), 100);
}

async function showAdminDashboard() {
  const c = document.getElementById('shop-content');
  if (!c) return;
  let total = 0, active = 0, pinned = 0;
  try {
    const { data } = await window.sb.from('products').select('is_active,is_pinned');
    total = (data||[]).length;
    (data||[]).forEach(x => { if (x.is_active) active++; if (x.is_pinned) pinned++; });
  } catch (e) {}
  c.innerHTML = `
    <div class="back-bar" onclick="loadShopPage()"><i class="fas fa-arrow-left"></i><span>Shop Admin</span></div>
    <div class="admin-top-row"><h3 style="margin:0">Admin Dashboard</h3>
      <button class="btn-add-prod" onclick="showAdminAddProduct()"><i class="fas fa-plus"></i> Add</button></div>
    <div class="admin-stats">
      <div class="admin-stat"><strong>${total}</strong><span>Total</span></div>
      <div class="admin-stat"><strong>${active}</strong><span>Active</span></div>
      <div class="admin-stat"><strong>${pinned}</strong><span>Pinned</span></div>
    </div>
    <button class="btn btn-outline" onclick="showAdminProductList()">All Products</button>
    <button class="btn btn-outline" style="margin-top:8px" onclick="showAdminBanners()">Banners</button>
  `;
}

function showAdminAddProduct(editId, data) {
  const d = data || {};
  document.getElementById('shop-content').innerHTML = `
    <div class="back-bar" onclick="showAdminDashboard()"><i class="fas fa-arrow-left"></i><span>${editId?'Edit':'Add'} Product</span></div>
    <div class="admin-form card-form">
      <label class="field-label">Name</label>
      <input type="text" id="ap-name" value="${esc(d.name||'')}" placeholder="Product name">
      <label class="field-label">Category</label>
      <select id="ap-category">
        ${['books','tshirts','mugs','stationery','accessories'].map(c =>
          `<option value="${c}" ${(d.category||'')===c?'selected':''}>${CAT_LABELS[c]}</option>`).join('')}
      </select>
      <label class="field-label">Description</label>
      <textarea id="ap-desc" rows="3">${escHtml(d.description||'')}</textarea>
      <label class="field-label">Product image</label>
      <div class="img-upload-row">
        <input type="file" id="ap-image-file" accept="image/*">
        <button type="button" class="btn-sm btn-outline" onclick="uploadProductImage()">Upload</button>
      </div>
      <input type="url" id="ap-image" value="${esc(d.image_url||'')}" placeholder="Image URL after upload">
      <p id="ap-upload-status" style="font-size:12px;color:var(--text-light)"></p>
      <label class="field-label">Flipkart URL</label>
      <input type="url" id="ap-flipkart" value="${esc(d.flipkart_url||'')}">
      <label class="field-label">Amazon URL</label>
      <input type="url" id="ap-amazon" value="${esc(d.amazon_url||'')}">
      <label class="field-label">Meesho URL</label>
      <input type="url" id="ap-meesho" value="${esc(d.meesho_url||'')}">
      <div class="two-col">
        <div><label class="field-label">Other name</label><input type="text" id="ap-other-name" value="${esc(d.other_store_name||'')}"></div>
        <div><label class="field-label">Other URL</label><input type="url" id="ap-other-url" value="${esc(d.other_store_url||'')}"></div>
      </div>
      <div class="toggle-rows">
        <label class="toggle-row"><span>Featured</span><input type="checkbox" id="ap-featured" ${d.is_featured?'checked':''}></label>
        <label class="toggle-row"><span>Pinned</span><input type="checkbox" id="ap-pinned" ${d.is_pinned?'checked':''}></label>
        <label class="toggle-row"><span>Active</span><input type="checkbox" id="ap-active" ${d.is_active!==false?'checked':''}></label>
      </div>
      <button class="btn btn-primary dark-btn" id="ap-save" onclick="saveAdminProduct('${editId||''}')">Save</button>
    </div>`;
}

async function uploadProductImage() {
  const fileInput = document.getElementById('ap-image-file');
  const status = document.getElementById('ap-upload-status');
  const urlInput = document.getElementById('ap-image');
  if (!fileInput?.files?.[0]) { alert('Image choose karo'); return; }
  if (status) status.textContent = 'Uploading...';
  try {
    const file = fileInput.files[0];
    if (file.size > 5e6) throw new Error('Max 5MB');
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`;
    const { error } = await window.sb.storage.from('shop').upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = window.sb.storage.from('shop').getPublicUrl(path);
    if (urlInput) urlInput.value = data.publicUrl;
    if (status) status.textContent = 'Uploaded OK';
  } catch (err) {
    if (status) status.textContent = 'Failed';
    alert(err.message || 'Upload failed. Bucket "shop" public hona chahiye.');
  }
}

async function saveAdminProduct(editId) {
  const name = document.getElementById('ap-name').value.trim();
  if (!name) { alert('Name required'); return; }
  const payload = {
    name,
    category: document.getElementById('ap-category').value,
    description: document.getElementById('ap-desc').value.trim(),
    image_url: document.getElementById('ap-image').value.trim(),
    flipkart_url: document.getElementById('ap-flipkart').value.trim(),
    amazon_url: document.getElementById('ap-amazon').value.trim(),
    meesho_url: document.getElementById('ap-meesho').value.trim(),
    other_store_name: document.getElementById('ap-other-name').value.trim(),
    other_store_url: document.getElementById('ap-other-url').value.trim(),
    is_pinned: document.getElementById('ap-pinned').checked,
    is_featured: document.getElementById('ap-featured').checked,
    is_active: document.getElementById('ap-active').checked,
    updated_at: new Date().toISOString()
  };
  const btn = document.getElementById('ap-save');
  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    if (editId) {
      const { error } = await window.sb.from('products').update(payload).eq('id', editId);
      if (error) throw error;
    } else {
      payload.created_at = new Date().toISOString();
      const { error } = await window.sb.from('products').insert(payload);
      if (error) throw error;
    }
    alert('Saved');
    showAdminDashboard();
  } catch (err) {
    alert('Failed: ' + (err.message || ''));
  }
  btn.disabled = false; btn.textContent = 'Save';
}

async function showAdminProductList() {
  const c = document.getElementById('shop-content');
  c.innerHTML = `<div class="back-bar" onclick="showAdminDashboard()"><i class="fas fa-arrow-left"></i><span>Products</span></div>
    <div class="empty-state"><i class="fas fa-spinner fa-spin"></i></div>`;
  try {
    const { data, error } = await window.sb.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    let html = `<div class="back-bar" onclick="showAdminDashboard()"><i class="fas fa-arrow-left"></i><span>Products</span></div>
      <div class="admin-top-row"><h3 style="margin:0">Catalogue</h3>
      <button class="btn-add-prod" onclick="showAdminAddProduct()"><i class="fas fa-plus"></i> Add</button></div>`;
    (data||[]).forEach(p => {
      const safe = JSON.stringify(p).replace(/'/g, '&#39;');
      html += `<div class="admin-list-item">
        <div class="admin-list-left">
          <div class="admin-thumb">${p.image_url?`<img src="${esc(p.image_url)}">`:'<i class="fas fa-image"></i>'}</div>
          <div><strong>${escHtml(p.name)}</strong>
          <small>${escHtml(CAT_LABELS[p.category]||'')} · ${p.is_active?'Active':'Off'}</small></div>
        </div>
        <div class="admin-list-actions">
          <label class="switch"><input type="checkbox" ${p.is_active?'checked':''} onchange="toggleProduct('${p.id}', this.checked)"><span class="slider"></span></label>
          <button class="icon-btn" onclick='
