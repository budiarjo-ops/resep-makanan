/* app.js — Main page logic */

let currentCategory = 'semua';
let currentSearch = '';
let currentView = 'semua';
let allRecipes = [...recipes];
let favorites = JSON.parse(localStorage.getItem('dapurkita_favs') || '[]');

// ==================
// INIT
// ==================
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderRecipes();
  updateFavCount();
  setupSearchInput();
  loadPublicRecipes();
});

async function loadPublicRecipes() {
  const status = document.getElementById('api-status');
  try {
    const publicRecipes = await getPublicRecipes();
    allRecipes = [...recipes, ...publicRecipes];
    renderRecipes();
    if (status) status.textContent = `${publicRecipes.length} resep tambahan dari API publik`;
  } catch (error) {
    if (status) status.textContent = 'Resep API sementara tidak tersedia; resep pilihan tetap bisa dibuka.';
  }
}

// ==================
// CATEGORIES
// ==================
function renderCategories() {
  const container = document.getElementById('category-filter');
  container.innerHTML = categories.map(cat => `
    <button
      class="cat-btn ${cat.id === 'semua' ? 'active' : ''}"
      id="cat-${cat.id}"
      onclick="filterCategory('${cat.id}')"
    >
      ${cat.icon} ${cat.label}
    </button>
  `).join('');
}

function filterCategory(catId) {
  currentCategory = catId;
  document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`cat-${catId}`).classList.add('active');

  const cat = categories.find(c => c.id === catId);
  document.getElementById('section-title').textContent =
    catId === 'semua' ? 'Semua Resep' : `Resep ${cat.label}`;
  document.getElementById('section-subtitle').textContent =
    catId === 'semua' ? 'Pilih resep favoritmu dan mulai memasak' : `Koleksi resep ${cat.label.toLowerCase()} pilihan`;

  renderRecipes();
}

// ==================
// SEARCH
// ==================
function setupSearchInput() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim().toLowerCase();
    renderRecipes();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

function handleSearch() {
  const input = document.getElementById('search-input');
  currentSearch = input.value.trim().toLowerCase();
  renderRecipes();
}

// ==================
// RENDER RECIPES
// ==================
function getFilteredRecipes() {
  return allRecipes.filter(r => {
    const matchCat = currentCategory === 'semua' || r.category === currentCategory;
    const matchSearch = !currentSearch ||
      r.name.toLowerCase().includes(currentSearch) ||
      r.description.toLowerCase().includes(currentSearch) ||
      r.tags.some(t => t.includes(currentSearch)) ||
      r.ingredients.some(i => i.item.toLowerCase().includes(currentSearch));
    return matchCat && matchSearch;
  });
}

function renderRecipes() {
  const grid = document.getElementById('recipe-grid');
  const filtered = getFilteredRecipes();

  document.getElementById('results-info').textContent =
    `${filtered.length} resep ditemukan`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">Resep tidak ditemukan</h3>
        <p class="empty-desc">Coba kata kunci lain atau pilih kategori berbeda</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((r, i) => createRecipeCard(r, i)).join('');
}

function createRecipeCard(recipe, index = 0) {
  const isFav = favorites.includes(recipe.id);
  const diffClass = `difficulty-${recipe.difficulty.toLowerCase()}`;
  const stars = '⭐'.repeat(Math.round(recipe.rating));
  const catLabel = categories.find(c => c.id === recipe.category)?.label || '';

  return `
    <article
      class="recipe-card"
      style="animation-delay: ${index * 0.07}s"
      onclick="goToRecipe(${recipe.id})"
      id="recipe-card-${recipe.id}"
    >
      <div class="card-img-wrapper">
        <img
          class="card-img"
          src="${recipe.image}"
          alt="${recipe.name}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'"
        />
        <div class="card-img-overlay"></div>
        <span class="card-difficulty ${diffClass}">${recipe.difficulty}</span>
        <button
          class="card-fav-btn ${isFav ? 'favorited' : ''}"
          id="fav-btn-${recipe.id}"
          onclick="event.stopPropagation(); toggleFavorite(${recipe.id})"
          title="${isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}"
        >${isFav ? '❤️' : '🤍'}</button>
        <div class="card-rating">⭐ ${recipe.rating}</div>
      </div>
      <div class="card-body">
        <div class="card-category">${catLabel}</div>
        <h3 class="card-title">${recipe.name}</h3>
        <p class="card-desc">${recipe.description}</p>
        <div class="card-meta">
          <div class="card-meta-item">
            <span>⏱️</span>
            <span>${recipe.time < 60 ? recipe.time + ' mnt' : Math.floor(recipe.time/60) + ' jam' + (recipe.time%60 ? ' '+recipe.time%60+' mnt' : '')}</span>
          </div>
          <div class="card-meta-item">
            <span>👥</span>
            <span>${recipe.servings} porsi</span>
          </div>
          <div class="card-meta-item">
            <span>🔥</span>
            <span>${recipe.calories} kkal</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

// ==================
// NAVIGATE
// ==================
function goToRecipe(id) {
  const isPublicRecipe = Number(id) >= API_RECIPE_ID_OFFSET;
  const apiId = isPublicRecipe ? Number(id) - API_RECIPE_ID_OFFSET : null;
  window.location.href = isPublicRecipe
    ? `recipe.html?id=${encodeURIComponent(apiId)}&source=public-api`
    : `recipe.html?id=${id}`;
}

// ==================
// VIEWS
// ==================
function showView(view) {
  currentView = view;
  document.getElementById('view-semua').style.display = view === 'semua' ? 'block' : 'none';
  document.getElementById('view-favorit').style.display = view === 'favorit' ? 'block' : 'none';
  document.getElementById('btn-semua').classList.toggle('active', view === 'semua');
  document.getElementById('btn-favorit').classList.toggle('active', view === 'favorit');

  if (view === 'favorit') renderFavorites();
}

function renderFavorites() {
  const grid = document.getElementById('fav-grid');
  const favRecipes = allRecipes.filter(r => favorites.includes(r.id));

  if (favRecipes.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❤️</div>
        <h3 class="empty-title">Belum ada resep favorit</h3>
        <p class="empty-desc">Klik ikon hati di resep untuk menyimpannya di sini</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = favRecipes.map((r, i) => createRecipeCard(r, i)).join('');
}

// ==================
// FAVORITES
// ==================
function toggleFavorite(id) {
  const idx = favorites.indexOf(id);
  if (idx === -1) {
    favorites.push(id);
    showToast('❤️', 'Disimpan ke favorit!');
  } else {
    favorites.splice(idx, 1);
    showToast('💔', 'Dihapus dari favorit');
  }
  localStorage.setItem('dapurkita_favs', JSON.stringify(favorites));
  updateFavCount();

  // Update card button
  const btn = document.getElementById(`fav-btn-${id}`);
  if (btn) {
    const isFav = favorites.includes(id);
    btn.classList.toggle('favorited', isFav);
    btn.textContent = isFav ? '❤️' : '🤍';
    btn.title = isFav ? 'Hapus dari favorit' : 'Simpan ke favorit';
  }

  // Re-render favorites view if active
  if (currentView === 'favorit') renderFavorites();
}

function updateFavCount() {
  const countEl = document.getElementById('fav-count');
  if (!countEl) return;
  countEl.textContent = favorites.length;
  countEl.classList.toggle('show', favorites.length > 0);
}

// ==================
// TOAST
// ==================
function showToast(icon, msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
