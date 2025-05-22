// src/scripts/mvp/view/home-view.js

export default class HomeView {
  constructor() {
    this._storiesContainer = null;
    this._mapContainer = null;
    this._map = null;
    this._markersLayer = null;
    this._presenter = null;
  }

  initView(presenter) {
    this._presenter = presenter;
    
    // Initialize DOM elements
    this._storiesContainer = document.getElementById('stories-container');
    this._mapContainer = document.getElementById('map-container');
    
    // Setup event listeners - DOM manipulation dilakukan di view
    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Setup logout button handler
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton && this._presenter) {
      logoutButton.addEventListener('click', () => {
        this._presenter.handleLogout();
      });
    }
  }

  showLoading() {
    if (this._storiesContainer) {
      this._storiesContainer.innerHTML = '<p class="loading-message" role="status" aria-live="polite">Loading stories...</p>';
    }
  }

  showStories(stories) {
    if (!this._storiesContainer) return;
    
    this._storiesContainer.innerHTML = '';

    stories.forEach((story) => {
      this._storiesContainer.innerHTML += this._createStoryItemTemplate(story);
    });

    // Tambahkan event listener pada setiap item
    document.querySelectorAll('.story-item').forEach((item) => {
      item.addEventListener('click', () => {
        const storyId = item.dataset.id;
        this.navigate(`#/detail/${storyId}`);
      });
      
      // Tambahkan keyboard support
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const storyId = item.dataset.id;
          this.navigate(`#/detail/${storyId}`);
        }
      });
    });

    // Inisialisasi peta dengan data cerita
    this.initializeMap(stories);
  }

  showEmptyState() {
    if (this._storiesContainer) {
      this._storiesContainer.innerHTML = '<p class="empty-state" role="status">Belum ada cerita yang tersedia.</p>';
    }
  }

  showError(message) {
    if (this._storiesContainer) {
      this._storiesContainer.innerHTML = `<p class="error-message" role="alert" aria-live="assertive">Error loading stories: ${message}</p>`;
    }
  }

  initializeMap(stories) {
    if (!this._mapContainer) return;

    if (!window.L) {
      console.error('Leaflet tidak tersedia');
      return;
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.warn('Elemen peta tidak ditemukan');
      return;
    }

    try {
      // Bersihkan peta lama jika ada
      if (this._map) {
        this._map.remove();
        this._map = null;
      }

      // Buat instance baru
      this._map = L.map(mapElement, {
        // Tambahkan accessibility attributes
        attributionControl: true,
        zoomControl: true
      }).setView([-2.5, 118], 5); // Center di Indonesia

      // Tambahkan layer OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this._map);

      this._markersLayer = L.layerGroup().addTo(this._map);

      const bounds = [];

      stories.forEach(story => {
        if (story.lat && story.lon) {
          const marker = L.marker([story.lat, story.lon], {
            // Tambahkan alt text untuk marker
            alt: `Lokasi cerita dari ${story.name}`
          })
            .bindPopup(`
              <div class="popup-content">
                <h4>${story.name}</h4>
                <p>${story.description ? story.description.substring(0, 100) : ''}${story.description?.length > 100 ? '...' : ''}</p>
                <a href="#/detail/${story.id}" aria-label="Lihat detail cerita ${story.name}">Lihat detail</a>
              </div>
            `)
            .addTo(this._markersLayer);

          bounds.push([story.lat, story.lon]);
        }
      });

      if (bounds.length > 0) {
        this._map.fitBounds(bounds);
      }

      // Tambahkan ARIA label untuk peta
      setTimeout(() => {
        const mapContainer = document.querySelector('.stories-map');
        if (mapContainer) {
          mapContainer.setAttribute('role', 'img');
          mapContainer.setAttribute('aria-label', 'Peta interaktif menampilkan lokasi cerita-cerita');
        }
      }, 200);

      setTimeout(() => {
        if (this._map) {
          this._map.invalidateSize();
        }
      }, 100);
    } catch (error) {
      console.error('Error inisialisasi peta:', error);
    }
  }

  _createStoryItemTemplate(story) {
    return `
      <article class="story-item" data-id="${story.id}" tabindex="0" role="button" aria-label="Baca cerita dari ${story.name}">
        <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" class="story-image" loading="lazy">
        <div class="story-content">
          <h3 class="story-name">${story.name}</h3>
          <p class="story-description">${story.description ? story.description.substring(0, 150) : ''}${story.description?.length > 150 ? '...' : ''}</p>
          <time class="story-date" datetime="${story.createdAt}">${this._formatDate(story.createdAt)}</time>
        </div>
      </article>
    `;
  }

  _formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  navigate(url) {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.hash = url;
      });
    } else {
      window.location.hash = url;
    }
  }

  redirectToLogin() {
    this.navigate('#/login');
  }

  redirectToHome() {
    this.navigate('#/');
  }
}