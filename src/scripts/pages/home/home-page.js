// src/scripts/pages/home/home-page.js

import StoryAPI from '../../data/story-api';
import AuthRepository from '../../data/auth-repository';
import HomeView from '../../mvp/view/home-view';
import HomePresenter from '../../mvp/presenter/HomePresenter';
import StoryModel from '../../mvp/model/StoryModel';
import AuthModel from '../../mvp/model/AuthModel';

export default class HomePage {
  async render() {
    return `
      <div class="home-container container">
        <a href="#mainContent" class="skip-link">Skip to content</a>
        
        <header>
          <h1 tabindex="0">StoryApp</h1>
          <div class="header-actions">
            ${this._getHeaderActionButtons()}
          </div>
        </header>
        
        <main id="mainContent" tabindex="-1">
          <section class="story-list" id="story-list">
            <h2 tabindex="0">Cerita Terbaru</h2>
            <div id="stories-container" class="stories-container">
              <p>Loading stories...</p>
            </div>
          </section>
          
          <!-- Penambahan Container untuk Peta -->
          <section class="map-section">
            <h2 tabindex="0">Peta Cerita</h2>
            <div id="map-container" class="map-container">
              <div id="map" class="stories-map"></div>
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
    // Implementasi skip-link - perbaikan untuk memastikan element ada sebelum fokus
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('mainContent');
    
    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (event) => {
        event.preventDefault();
        // Pastikan element ada sebelum memanggil focus()
        if (mainContent) {
          mainContent.focus();
        }
      });
    }
    
    // Inisialisasi View
    const view = new HomeView();
    
    // Inisialisasi Model
    const storyModel = new StoryModel(StoryAPI);
    const authModel = new AuthModel(StoryAPI, AuthRepository);
    
    // Inisialisasi Presenter
    new HomePresenter({
      view,
      storyModel,
      authModel
    });
  }
}