import StoryAPI from '../../data/story-api';
import { showFormattedDate } from '../../utils';
import MapInitializer from '../../utils/map-initializer';
import AuthRepository from '../../data/auth-repository';
import ViewTransition from '../../utils/view-transition';

export default class StoryDetailPage {
  constructor() {
    this.map = null;
  }
  
  async render() {
    return `
      <div class="detail-container container">
        <a href="#main-content" class="skip-link">Skip to content</a>
        
        <a href="#/" class="back-button" aria-label="Kembali ke halaman utama">
          <span>&larr;</span> Kembali
        </a>
        
        <main id="main-content">
          <article id="story-detail" class="story-detail">
            <p>Loading story details...</p>
          </article>
          
          <div id="map-container" class="map-container">
            <div id="story-map" class="story-map"></div>
          </div>
        </main>
      </div>
    `;
  }

  async afterRender() {
    // Periksa otentikasi
    if (!AuthRepository.isAuthenticated()) {
      ViewTransition.transit(() => {
        window.location.hash = '#/login';
      });
      return;
    }
    
    // Implementasi skip-link
    const skipLink = document.querySelector('.skip-link');
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('main-content').focus();
    });
    
    // Ambil ID dari URL
    const url = new URL(window.location.href);
    const storyId = url.hash.split('/')[2];
    
    if (!storyId) {
      ViewTransition.transit(() => {
        window.location.hash = '#/';
      });
      return;
    }
    
    // Load detail cerita
    await this._loadStoryDetail(storyId);
  }
  
  async _loadStoryDetail(storyId) {
    const storyDetailContainer = document.getElementById('story-detail');
    const mapContainer = document.getElementById('story-map');
    
    try {
      const story = await StoryAPI.getStoryDetail(storyId);
      
      if (!story) {
        storyDetailContainer.innerHTML = '<p class="error-message">Story not found</p>';
        return;
      }
      
      storyDetailContainer.innerHTML = this._createStoryDetailTemplate(story);
      
      // Inisialisasi peta jika story memiliki lokasi
      if (story.lat && story.lon) {
        // Pastikan script Mapbox sudah diload
        this.map = MapInitializer.initMap(mapContainer, story.lat, story.lon, 13);
        
        // Tambahkan marker
        MapInitializer.addMarker(
          this.map,
          story.lat,
          story.lon,
          `<div class="popup-content">
            <h4>${story.name}</h4>
            <p>${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
          </div>`
        );
      } else {
        document.getElementById('map-container').style.display = 'none';
      }
    } catch (error) {
      storyDetailContainer.innerHTML = `<p class="error-message">Error loading story: ${error.message}</p>`;
    }
  }
  
  _createStoryDetailTemplate(story) {
    return `
      <h1 class="story-title" tabindex="0">${story.name}</h1>
      <img src="${story.photoUrl}" alt="Gambar cerita dari ${story.name}" class="story-image">
      <div class="story-meta">
        <p class="story-date">${showFormattedDate(story.createdAt)}</p>
      </div>
      <div class="story-body">
        <p class="story-description">${story.description}</p>
      </div>
    `;
  }
}