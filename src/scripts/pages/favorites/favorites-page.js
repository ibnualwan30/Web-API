// src/scripts/pages/favorites/favorites-page.js
import indexedDBHelper from '../../data/indexeddb-helper';

export default class FavoritesPage {
  constructor() {
    this.favorites = [];
  }

  async render() {
    return `
      <section class="favorites-section">
        <div class="container">
          <h1 tabindex="0">Cerita Favorit</h1>
          <p class="favorites-description">Kumpulan cerita yang telah Anda simpan sebagai favorit</p>
          
          <div class="favorites-actions">
            <button id="clear-favorites" class="clear-btn" style="display: none;">
              Hapus Semua Favorit
            </button>
            <button id="refresh-favorites" class="refresh-btn">
              Refresh
            </button>
          </div>
          
          <div id="favorites-container" class="favorites-container">
            <div class="loading-state">
              <p>Memuat cerita favorit...</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.loadFavorites();
    this.setupEventListeners();
  }

  async loadFavorites() {
    const container = document.getElementById('favorites-container');
    const clearButton = document.getElementById('clear-favorites');
    
    try {
      this.favorites = await indexedDBHelper.getFavorites();
      
      if (this.favorites.length === 0) {
        container.innerHTML = this.renderEmptyState();
        clearButton.style.display = 'none';
      } else {
        container.innerHTML = this.renderFavorites(this.favorites);
        clearButton.style.display = 'inline-block';
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      container.innerHTML = this.renderErrorState();
    }
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">⭐</div>
        <h3>Belum Ada Favorit</h3>
        <p>Anda belum menyimpan cerita apapun sebagai favorit.</p>
        <p>Kembali ke <a href="#/">halaman utama</a> untuk menjelajahi cerita.</p>
      </div>
    `;
  }

  renderErrorState() {
    return `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Gagal Memuat Favorit</h3>
        <p>Terjadi kesalahan saat memuat cerita favorit.</p>
        <button id="retry-load" class="retry-btn">Coba Lagi</button>
      </div>
    `;
  }

  renderFavorites(favorites) {
    const favoriteItems = favorites.map(story => `
      <div class="favorite-item" data-id="${story.id}">
        <div class="favorite-image">
          <img src="${story.photoUrl}" alt="Foto cerita ${story.name}" loading="lazy">
        </div>
        <div class="favorite-content">
          <h3 class="favorite-title">${story.name}</h3>
          <p class="favorite-description">${this.truncateText(story.description, 100)}</p>
          <div class="favorite-meta">
            <time class="favorite-date" datetime="${story.createdAt}">
              ${this.formatDate(story.createdAt)}
            </time>
            <span class="favorite-added-date">
              Ditambahkan: ${this.formatDate(story.dateAdded)}
            </span>
          </div>
          <div class="favorite-actions">
            <button class="view-story-btn" data-id="${story.id}">
              Lihat Cerita
            </button>
            <button class="remove-favorite-btn" data-id="${story.id}">
              Hapus dari Favorit
            </button>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="favorites-grid">
        ${favoriteItems}
      </div>
    `;
  }

  setupEventListeners() {
    // Refresh favorites
    const refreshButton = document.getElementById('refresh-favorites');
    refreshButton?.addEventListener('click', () => {
      this.loadFavorites();
    });

    // Clear all favorites
    const clearButton = document.getElementById('clear-favorites');
    clearButton?.addEventListener('click', async () => {
      if (confirm('Apakah Anda yakin ingin menghapus semua favorit?')) {
        await this.clearAllFavorites();
      }
    });

    // Retry loading on error
    const retryButton = document.getElementById('retry-load');
    retryButton?.addEventListener('click', () => {
      this.loadFavorites();
    });

    // Event delegation for favorite items
    const container = document.getElementById('favorites-container');
    container.addEventListener('click', (event) => {
      const target = event.target;
      
      if (target.classList.contains('view-story-btn')) {
        const storyId = target.dataset.id;
        window.location.hash = `#/detail/${storyId}`;
      } else if (target.classList.contains('remove-favorite-btn')) {
        const storyId = target.dataset.id;
        this.removeFavorite(storyId);
      }
    });
  }

  async removeFavorite(storyId) {
    try {
      await indexedDBHelper.removeFromFavorites(storyId);
      
      // Show success message
      this.showNotification('Cerita berhasil dihapus dari favorit', 'success');
      
      // Reload favorites
      await this.loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      this.showNotification('Gagal menghapus favorit', 'error');
    }
  }

  async clearAllFavorites() {
    try {
      // Get all favorites and remove them one by one
      const favorites = await indexedDBHelper.getFavorites();
      
      for (const favorite of favorites) {
        await indexedDBHelper.removeFromFavorites(favorite.id);
      }
      
      this.showNotification('Semua favorit berhasil dihapus', 'success');
      await this.loadFavorites();
    } catch (error) {
      console.error('Error clearing favorites:', error);
      this.showNotification('Gagal menghapus favorit', 'error');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}