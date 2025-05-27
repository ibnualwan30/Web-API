// src/scripts/mvp/view/story-detail-view.js

export default class StoryDetailView {
  constructor() {
    this._articleContainer = null;
    this._mapContainer = null;
    this._map = null;
  }
  
  initView(presenter) {
    this._presenter = presenter;
    
    // Initialize DOM elements
    this._articleContainer = document.getElementById('story-detail');
    this._mapContainer = document.getElementById('map-container');
  }
  
  showLoading() {
    if (this._articleContainer) {
      this._articleContainer.innerHTML = '<p class="loading" role="status" aria-live="polite">Loading story details...</p>';
    }
  }

  // UPDATED METHOD - Tambah setup favorite button
  showStoryDetail(story) {
    if (!this._articleContainer) return;
    this._articleContainer.innerHTML = this._createStoryDetailTemplate(story);
    
    // Setup favorite button setelah render
    this._setupFavoriteButton(story);
  }

  // NEW METHOD - Setup favorite button functionality
  async _setupFavoriteButton(story) {
    const favoriteButton = document.getElementById('favorite-button');
    if (!favoriteButton) return;
    
    try {
      // Import IndexedDB helper
      const { default: indexedDBHelper } = await import('../../data/indexeddb-helper');
      
      // Check if already favorite
      const isFavorite = await indexedDBHelper.isFavorite(story.id);
      this._updateFavoriteButton(favoriteButton, isFavorite);
      
      // Add click handler
      favoriteButton.addEventListener('click', async () => {
        try {
          const currentlyFavorite = await indexedDBHelper.isFavorite(story.id);
          
          if (currentlyFavorite) {
            await indexedDBHelper.removeFromFavorites(story.id);
            this._updateFavoriteButton(favoriteButton, false);
            this._showNotification('Dihapus dari favorit', 'info');
          } else {
            await indexedDBHelper.addToFavorites(story);
            this._updateFavoriteButton(favoriteButton, true);
            this._showNotification('Ditambahkan ke favorit', 'success');
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
          this._showNotification('Gagal mengubah favorit', 'error');
        }
      });
    } catch (error) {
      console.error('Error setting up favorite button:', error);
      // Hide button if there's an error
      favoriteButton.style.display = 'none';
    }
  }

  // NEW METHOD - Update button appearance
  _updateFavoriteButton(button, isFavorite) {
    if (isFavorite) {
      button.innerHTML = '❤️ Hapus dari Favorit';
      button.classList.add('favorited');
    } else {
      button.innerHTML = '🤍 Tambah ke Favorit';
      button.classList.remove('favorited');
    }
  }

  // NEW METHOD - Show notification
  _showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease;
      max-width: 300px;
      font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showError(message) {
    if (this._articleContainer) {
      this._articleContainer.innerHTML = `<p class="error-message" role="alert" aria-live="assertive">${message}</p>`;
    }
  }

  hideMap() {
    if (this._mapContainer) {
      this._mapContainer.style.display = 'none';
      this._mapContainer.setAttribute('aria-hidden', 'true');
    }
  }

  showMap(story) {
    // Pastikan container untuk peta ada
    if (!this._mapContainer) return;
    
    // Make sure the map container is visible
    this._mapContainer.style.display = 'block';
    this._mapContainer.removeAttribute('aria-hidden');
    
    // Tambahkan div untuk peta jika belum ada
    if (!document.getElementById('story-map')) {
      const mapDiv = document.createElement('div');
      mapDiv.id = 'story-map';
      mapDiv.className = 'story-map';
      mapDiv.setAttribute('role', 'img');
      mapDiv.setAttribute('aria-label', `Peta lokasi cerita ${story.name}`);
      this._mapContainer.appendChild(mapDiv);
    }
    
    this._initializeMap(story);
  }
  
  _initializeMap(story) {
    if (!window.L) {
      console.error('Leaflet tidak tersedia');
      return;
    }
    
    const mapElement = document.getElementById('story-map');
    if (!mapElement) return;
    
    try {
      // Buat instance peta
      this._map = L.map(mapElement, {
        attributionControl: true,
        zoomControl: true
      }).setView([story.lat, story.lon], 13);
      
      // Tambahkan tile layer OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this._map);
      
      // Tambahkan marker
      L.marker([story.lat, story.lon], {
        alt: `Lokasi cerita ${story.name}`
      })
        .bindPopup(`
          <div class="popup-content">
            <h4>${story.name}</h4>
            <p>${story.description ? story.description.substring(0, 100) : ''}${story.description?.length > 100 ? '...' : ''}</p>
          </div>
        `)
        .addTo(this._map)
        .openPopup();
      
      // Pastikan peta diresize dengan benar
      setTimeout(() => {
        if (this._map) {
          this._map.invalidateSize();
        }
      }, 100);
    } catch (error) {
      console.error('Error inisialisasi peta:', error);
      this.hideMap();
    }
  }

  // UPDATED METHOD - Tambah favorite button ke template
  _createStoryDetailTemplate(story) {
  console.log('🎨 Creating story detail template for:', story.name);
  
  return `
    <header>
      <h1 class="story-title" tabindex="0">${story.name}</h1>
    </header>
    
    <div class="story-actions">
      <button id="favorite-button" class="favorite-button">
        🤍 Tambah ke Favorit
      </button>
    </div>
    
    <div class="story-media">
      <img 
        src="${story.photoUrl}" 
        alt="Foto cerita dari ${story.name}" 
        class="story-image"
        loading="lazy"
      >
    </div>
    
    <div class="story-meta">
      <time class="story-date" datetime="${story.createdAt}">
        Dipublikasikan pada ${this._formatDate(story.createdAt)}
      </time>
    </div>
    
    <section class="story-body">
      <h2 class="sr-only">Isi Cerita</h2>
      <p class="story-description">${story.description}</p>
    </section>
  `;
}

  _formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  redirectToHome() {
    // Gunakan View Transition API jika tersedia
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.hash = '#/';
      });
    } else {
      window.location.hash = '#/';
    }
  }

  redirectToLogin() {
    // Gunakan View Transition API jika tersedia
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.hash = '#/login';
      });
    } else {
      window.location.hash = '#/login';
    }
  }
}