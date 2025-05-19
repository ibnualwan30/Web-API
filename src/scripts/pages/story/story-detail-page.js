// src/scripts/pages/story/story-detail-page.js

import StoryDetailView from '../../mvp/view/story-detail-view';
import StoryDetailPresenter from '../../mvp/presenter/StoryDetailPresenter';
import StoryAPI from '../../data/story-api';
import AuthRepository from '../../data/auth-repository';
import StoryModel from '../../mvp/model/StoryModel';
import AuthModel from '../../mvp/model/AuthModel';
import { parseActivePathname } from '../../routes/url-parser';

export default class StoryDetailPage {
  async render() {
    return `
      <div class="detail-container container">
        <a href="#main-content" class="skip-link">Skip to content</a>
        
        <a href="#/" class="back-button" aria-label="Kembali ke halaman utama">
          <span>&larr;</span> Kembali
        </a>
        
        <main id="main-content" tabindex="-1">
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
    // Implementasi skip-link - perbaikan untuk memastikan element ada sebelum fokus
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('main-content');
    
    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (event) => {
        event.preventDefault();
        // Pastikan element ada sebelum memanggil focus()
        if (mainContent) {
          mainContent.focus();
        }
      });
    }
    
    // Ambil ID dari URL
    const url = parseActivePathname();
    const storyId = url.id;
    
    // Inisialisasi View
    const view = new StoryDetailView();
    
    // Inisialisasi Model
    const storyModel = new StoryModel(StoryAPI);
    const authModel = new AuthModel(StoryAPI, AuthRepository);
    
    // Inisialisasi Presenter
    new StoryDetailPresenter({
      view,
      storyModel,
      authModel,
      storyId
    });
  }
}