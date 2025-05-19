// src/scripts/pages/story/add-story-page.js

import AddStoryView from '../../mvp/view/add-story-view';
import AddStoryPresenter from '../../mvp/presenter/AddStoryPresenter';
import StoryAPI from '../../data/story-api';
import AuthRepository from '../../data/auth-repository';
import StoryModel from '../../mvp/model/StoryModel';
import AuthModel from '../../mvp/model/AuthModel';

export default class AddStoryPage {
  async render() {
    return `
      <div class="add-story-container container">
        <a href="#mainContent" class="skip-link">Skip to content</a>
        
        <a href="#/" class="back-button" aria-label="Kembali ke halaman utama">
          <span>&larr;</span> Kembali
        </a>
        
        <main id="mainContent" tabindex="-1">
          <h1 tabindex="0">Tambah Cerita Baru</h1>
          
          <form id="add-story-form" class="add-story-form">
            <div class="form-group">
              <label for="description">Cerita Anda</label>
              <textarea id="description" name="description" required></textarea>
            </div>
            
            <div class="form-group camera-section">
              <label>Ambil Foto</label>
              <div class="camera-controls">
                <div class="camera-preview-container">
                  <video id="camera-preview" autoplay playsinline></video>
                  <canvas id="photo-canvas" style="display: none;"></canvas>
                </div>
                
                <div class="camera-buttons">
                  <button type="button" id="capture-button" class="capture-button">Ambil Foto</button>
                  <button type="button" id="recapture-button" class="recapture-button" style="display: none;">Ambil Ulang</button>
                </div>
                
                <div id="preview-container" class="preview-container" style="display: none;">
                  <img id="photo-preview" alt="Preview foto yang diambil">
                </div>
              </div>
            </div>
            
            <div class="form-group map-section">
              <label>Pilih Lokasi (Klik pada peta)</label>
              <div id="map" class="location-map"></div>
              <div class="selected-location">
                <p>Koordinat yang dipilih: <span id="selected-coords">Belum dipilih</span></p>
              </div>
            </div>
            
            <button type="submit" id="submit-button" disabled>Kirim Cerita</button>
          </form>
          
          <div id="status-container" class="status-container"></div>
        </main>
      </div>
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
    const view = new AddStoryView();
    
    // Inisialisasi Model
    const storyModel = new StoryModel(StoryAPI);
    const authModel = new AuthModel(StoryAPI, AuthRepository);
    
    // Inisialisasi Presenter
    new AddStoryPresenter({
      view,
      storyModel,
      authModel
    });
  }
}