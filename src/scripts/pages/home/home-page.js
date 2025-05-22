// src/scripts/pages/home/home-page.js - Complete with Navigation

import StoryAPI from '../../data/story-api';
import AuthRepository from '../../data/auth-repository';
import HomeView from '../../mvp/view/home-view';
import HomePresenter from '../../mvp/presenter/HomePresenter';
import StoryModel from '../../mvp/model/StoryModel';
import AuthModel from '../../mvp/model/AuthModel';

export default class HomePage {
  async render() {
    return `
      <section class="hero-section">
        <div class="container">
          <h1 tabindex="0">Selamat Datang di StoryApp</h1>
          <p>Bagikan cerita dan lokasi terbaik Anda dengan dunia</p>
        </div>
      </section>
      
      <section class="story-list">
        <div class="container">
          <h2 tabindex="0">Cerita Terbaru</h2>
          <div id="stories-container" class="stories-container">
            <p class="loading-message">Loading stories...</p>
          </div>
        </div>
      </section>
      
      <!-- Container untuk Peta -->
      <section class="map-section">
        <div class="container">
          <h2 tabindex="0">Peta Cerita</h2>
          <div id="map-container" class="map-container">
            <div id="map" class="stories-map"></div>
          </div>
        </div>
      </section>
      
      <div class="floating-action-button">
        <a href="#/add-story" aria-label="Tambah cerita baru">
          <span>+</span>
        </a>
      </div>
    `;
  }

  async afterRender() {
    // NO skip-link implementation - menggunakan global skip link dari index.html
    
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