/* recipe.js — Recipe detail page logic */

let favorites = JSON.parse(localStorage.getItem('dapurkita_favs') || '[]');
let currentRecipe = null;

// ==================
// INIT
// ==================
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  if (!id) {
    window.location.href = 'index.html';
    return;
  }

  currentRecipe = recipes.find(r => r.id === id);

  if (!currentRecipe) {
    window.location.href = 'index.html';
    return;
  }

  document.title = `${currentRecipe.name} — DapurKita`;
  renderDetail(currentRecipe);
  updateFavNavBtn();
});

// ==================
// RENDER DETAIL
// ==================
function renderDetail(recipe) {
  const root = document.getElementById('detail-root');
  const isFav = favorites.includes(recipe.id);
  const catLabel = getCategoryLabel(recipe.category);
  const stars = getStars(recipe.rating);
  const timeStr = formatTime(recipe.time);

  root.innerHTML = `
    <!-- Hero -->
    <div class="detail-hero">
      <img
        class="detail-hero-img"
        src="${recipe.image}"
        alt="${recipe.name}"
        onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80'"
      />
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-content">
        <div class="detail-breadcrumb">
          <a href="index.html">🏠 Beranda</a> › <a href="index.html">${catLabel}</a> › ${recipe.name}
        </div>
        <div class="detail-category-badge">${catLabel}</div>
        <h1 class="detail-title">${recipe.name}</h1>
        <div class="detail-rating-row">
          <span class="rating-stars">${stars}</span>
          <span class="rating-text">${recipe.rating}</span>
          <span class="review-count">(${recipe.reviews.toLocaleString('id-ID')} ulasan)</span>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="detail-body">

      <!-- Info Bar -->
      <div class="detail-info-bar">
        <div class="info-bar-item">
          <div class="info-bar-icon">⏱️</div>
          <div class="info-bar-value">${timeStr}</div>
          <div class="info-bar-label">Waktu Masak</div>
        </div>
        <div class="info-bar-item">
          <div class="info-bar-icon">👥</div>
          <div class="info-bar-value">${recipe.servings}</div>
          <div class="info-bar-label">Porsi</div>
        </div>
        <div class="info-bar-item">
          <div class="info-bar-icon">🔥</div>
          <div class="info-bar-value">${recipe.calories}</div>
          <div class="info-bar-label">Kalori (kkal)</div>
        </div>
        <div class="info-bar-item">
          <div class="info-bar-icon">📊</div>
          <div class="info-bar-value" style="color: ${getDifficultyColor(recipe.difficulty)}">${recipe.difficulty}</div>
          <div class="info-bar-label">Kesulitan</div>
        </div>
        <div class="info-bar-item">
          <div class="info-bar-icon">🥩</div>
          <div class="info-bar-value">${recipe.ingredients.length}</div>
          <div class="info-bar-label">Bahan</div>
        </div>
        <div class="info-bar-item">
          <div class="info-bar-icon">📝</div>
          <div class="info-bar-value">${recipe.steps.length}</div>
          <div class="info-bar-label">Langkah</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="detail-actions">
        <button class="btn-fav ${isFav ? 'favorited' : ''}" id="fav-detail-btn" onclick="toggleFavorite(${recipe.id})">
          ${isFav ? '❤️ Tersimpan di Favorit' : '🤍 Simpan ke Favorit'}
        </button>
        <a href="index.html" class="btn-secondary">← Kembali ke Beranda</a>
      </div>

      <!-- Description -->
      <p class="detail-desc">${recipe.description}</p>

      <!-- Tags -->
      <div class="tags-row">
        ${recipe.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
      </div>

      <!-- Tabs -->
      <div class="detail-tabs">
        <button class="tab-btn active" id="tab-btn-bahan" onclick="switchTab('bahan')">🥗 Bahan-bahan</button>
        <button class="tab-btn" id="tab-btn-langkah" onclick="switchTab('langkah')">👨‍🍳 Cara Memasak</button>
        <button class="tab-btn" id="tab-btn-nutrisi" onclick="switchTab('nutrisi')">📊 Nutrisi</button>
      </div>

      <!-- Tab: Bahan -->
      <div class="tab-panel active" id="tab-bahan">
        <div class="ingredients-grid">
          ${recipe.ingredients.map(ing => `
            <div class="ingredient-item">
              <span class="ingredient-amount">${ing.amount}</span>
              <span class="ingredient-name">${ing.item}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tab: Langkah -->
      <div class="tab-panel" id="tab-langkah">
        <div class="steps-list">
          ${recipe.steps.map(s => `
            <div class="step-item">
              <div class="step-number">${s.step}</div>
              <p class="step-text">${s.instruction}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tab: Nutrisi -->
      <div class="tab-panel" id="tab-nutrisi">
        <div class="nutrition-grid">
          <div class="nutrition-card">
            <div class="nutrition-value">${recipe.nutrition.carbs}<span class="nutrition-unit">g</span></div>
            <div class="nutrition-label">🌾 Karbohidrat</div>
          </div>
          <div class="nutrition-card">
            <div class="nutrition-value">${recipe.nutrition.protein}<span class="nutrition-unit">g</span></div>
            <div class="nutrition-label">🥩 Protein</div>
          </div>
          <div class="nutrition-card">
            <div class="nutrition-value">${recipe.nutrition.fat}<span class="nutrition-unit">g</span></div>
            <div class="nutrition-label">🫒 Lemak</div>
          </div>
          <div class="nutrition-card">
            <div class="nutrition-value">${recipe.nutrition.fiber}<span class="nutrition-unit">g</span></div>
            <div class="nutrition-label">🥦 Serat</div>
          </div>
        </div>
        <p style="margin-top:1rem; font-size:0.8rem; color:var(--clr-text-dim); text-align:center;">
          *Nilai nutrisi per porsi, perkiraan
        </p>
      </div>

      <!-- Related Recipes -->
      <div class="related-section">
        <h2 class="section-title">Resep Terkait</h2>
        <div class="related-grid">
          ${getRelated(recipe).map(r => createRelatedCard(r)).join('')}
        </div>
      </div>

    </div>
  `;

  // Animate in
  setTimeout(() => {
    document.querySelectorAll('.step-item, .ingredient-item, .nutrition-card').forEach((el, i) => {
      el.style.animationDelay = `${i * 0.05}s`;
      el.style.animation = 'fadeInUp 0.4s ease both';
    });
  }, 100);
}

// ==================
// RELATED CARDS
// ==================
function getRelated(recipe) {
  return recipes
    .filter(r => r.id !== recipe.id && (r.category === recipe.category || r.tags.some(t => recipe.tags.includes(t))))
    .slice(0, 4);
}

function createRelatedCard(recipe) {
  const isFav = favorites.includes(recipe.id);
  return `
    <article class="recipe-card" onclick="goToRecipe(${recipe.id})" style="cursor:pointer;">
      <div class="card-img-wrapper">
        <img
          class="card-img"
          src="${recipe.image}"
          alt="${recipe.name}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'"
        />
        <div class="card-img-overlay"></div>
        <div class="card-rating">⭐ ${recipe.rating}</div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${recipe.name}</h3>
        <div class="card-meta">
          <div class="card-meta-item"><span>⏱️</span><span>${formatTime(recipe.time)}</span></div>
          <div class="card-meta-item"><span>🔥</span><span>${recipe.calories} kkal</span></div>
        </div>
      </div>
    </article>
  `;
}

function goToRecipe(id) {
  window.location.href = `recipe.html?id=${id}`;
}

// ==================
// TABS
// ==================
function switchTab(tab) {
  ['bahan', 'langkah', 'nutrisi'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
    document.getElementById(`tab-btn-${t}`).classList.toggle('active', t === tab);
  });
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
  updateFavDetailBtn(id);
  updateFavNavBtn();
}

function updateFavDetailBtn(id) {
  const btn = document.getElementById('fav-detail-btn');
  if (!btn) return;
  const isFav = favorites.includes(id);
  btn.classList.toggle('favorited', isFav);
  btn.innerHTML = isFav ? '❤️ Tersimpan di Favorit' : '🤍 Simpan ke Favorit';
}

function updateFavNavBtn() {
  const btn = document.getElementById('btn-favorit-nav');
  if (!btn || !currentRecipe) return;
  const isFav = favorites.includes(currentRecipe.id);
  btn.classList.toggle('active', isFav);
}

function toggleFavFromNav() {
  if (currentRecipe) toggleFavorite(currentRecipe.id);
}

// ==================
// HELPERS
// ==================
function getCategoryLabel(catId) {
  const labels = {
    'sarapan': 'Sarapan',
    'makan-siang': 'Makan Siang',
    'makan-malam': 'Makan Malam',
    'dessert': 'Dessert',
    'minuman': 'Minuman'
  };
  return labels[catId] || catId;
}

function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

function formatTime(minutes) {
  if (minutes < 60) return `${minutes} mnt`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} jam ${m} mnt` : `${h} jam`;
}

function getDifficultyColor(difficulty) {
  const colors = { 'Mudah': '#34d399', 'Sedang': '#fcd34d', 'Sulit': '#f87171' };
  return colors[difficulty] || 'var(--clr-text)';
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
