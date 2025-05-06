import StoryAPI from '../../data/story-api';
import { showFormattedDate } from '../../utils';
import ViewTransition from '../../utils/view-transition';
import AuthRepository from '../../data/auth-repository';

export default class HomePage {
  async render() {
    return `
      <div class="home-container container">
        <a href="#main-content" class="skip-link">Skip to content</a>
        
        <header>
          <h1 tabindex="0">StoryApp</h1>
          <div class="header-actions">
            ${this._getHeaderActionButtons()}
          </div>
        </header>
        
        <main id="main-content">
          <section class="story-list" id="story-list">
            <h2 tabindex="0">Cerita Terbaru</h2>
            <div id="stories-container" class="stories-container">
              <p>Loading stories...</p>
            </div>
          </section>
        </main>
        
        <div class="floating-action-button">
          <a href="#/add-story" aria-label="Tambah cerita baru">
            <span>+</span>
          </a>
        </div>
      </div>
    `;
  }

  _getHeaderActionButtons() {
    if (AuthRepository.isAuthenticated()) {
      return `
        <button id="logout-button" class="logout-button">Logout</button>
      `;
    }
    return `
      <a href="#/login" class="login-button">Login</a>
      <a href="#/register" class="register-button">Register</a>
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
    
    // Setup event listener untuk logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        StoryAPI.logout();
        ViewTransition.transit(() => {
          window.location.hash = '#/login';
        });
      });
    }
    
    // Implementasi skip-link
    const skipLink = document.querySelector('.skip-link');
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('main-content').focus();
    });
    
    // Ambil dan tampilkan cerita
    await this._loadStories();
  }
  
  async _loadStories() {
    const storiesContainer = document.getElementById('stories-container');
    
    try {
      const stories = await StoryAPI.getAllStories();
      
      if (stories.length === 0) {
        storiesContainer.innerHTML = '<p class="empty-state">Belum ada cerita yang tersedia.</p>';
        return;
      }
      
      storiesContainer.innerHTML = '';
      
      stories.forEach((story) => {
        storiesContainer.innerHTML += this._createStoryItemTemplate(story);
      });
      
      // Tambahkan event listener pada setiap item
      document.querySelectorAll('.story-item').forEach((item) => {
        item.addEventListener('click', (event) => {
          const storyId = item.dataset.id;
          ViewTransition.transit(() => {
            window.location.hash = `#/detail/${storyId}`;
          });
        });
      });
    } catch (error) {
      storiesContainer.innerHTML = `<p class="error-message">Error loading stories: ${error.message}</p>`;
    }
  }
  
  _createStoryItemTemplate(story) {
    return `
      <article class="story-item" data-id="${story.id}">
        <img src="${story.photoUrl}" alt="Gambar cerita dari ${story.name}" class="story-image">
        <div class="story-content">
          <h3 class="story-name">${story.name}</h3>
          <p class="story-description">${story.description.substring(0, 150)}${story.description.length > 150 ? '...' : ''}</p>
          <p class="story-date">${showFormattedDate(story.createdAt)}</p>
        </div>
      </article>
    `;
  }
}