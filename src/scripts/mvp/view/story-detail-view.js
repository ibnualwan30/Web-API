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
      this._articleContainer.innerHTML = '<p class="loading">Loading story details...</p>';
    }
  }

  showStoryDetail(story) {
    if (!this._articleContainer) return;
    this._articleContainer.innerHTML = this._createStoryDetailTemplate(story);
  }

  showError(message) {
    if (this._articleContainer) {
      this._articleContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }
  }

  hideMap() {
    if (this._mapContainer) {
      this._mapContainer.style.display = 'none';
    }
  }

  showMap(story) {
    // Pastikan container untuk peta ada
    if (!this._mapContainer) return;
    
    // Make sure the map container is visible
    this._mapContainer.style.display = 'block';
    
    // Tambahkan div untuk peta jika belum ada
    if (!document.getElementById('story-map')) {
      const mapDiv = document.createElement('div');
      mapDiv.id = 'story-map';
      mapDiv.className = 'story-map';
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
      this._map = L.map(mapElement).setView([story.lat, story.lon], 13);
      
      // Tambahkan tile layer OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this._map);
      
      // Tambahkan marker
      L.marker([story.lat, story.lon])
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

  _createStoryDetailTemplate(story) {
    return `
      <h1 class="story-title" tabindex="0">${story.name}</h1>
      <img src="${story.photoUrl}" alt="Gambar cerita dari ${story.name}" class="story-image">
      <div class="story-meta">
        <p class="story-date">${this._formatDate(story.createdAt)}</p>
      </div>
      <div class="story-body">
        <p class="story-description">${story.description}</p>
      </div>
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