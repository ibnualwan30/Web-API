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
          <span aria-hidden="true">&larr;</span> Kembali
        </a>
        
        <main id="mainContent" tabindex="-1">
          <h1 tabindex="0">Tambah Cerita Baru</h1>
          
          <form id="add-story-form" class="add-story-form" novalidate>
            <fieldset class="form-group">
              <legend class="sr-only">Informasi Cerita</legend>
              <label for="description">Cerita Anda *</label>
              <textarea 
                id="description" 
                name="description" 
                required 
                aria-required="true"
                aria-describedby="description-help"
                placeholder="Ceritakan pengalaman menarik Anda..."
              ></textarea>
              <div id="description-help" class="help-text">Deskripsikan pengalaman atau momen yang ingin Anda bagikan</div>
            </fieldset>
            
            <fieldset class="form-group camera-section">
              <legend>Ambil Foto *</legend>
              <div class="camera-controls">
                <div class="camera-preview-container" role="img" aria-label="Preview kamera">
                  <video 
                    id="camera-preview" 
                    autoplay 
                    playsinline 
                    aria-label="Stream kamera untuk mengambil foto"
                  ></video>
                  <canvas id="photo-canvas" style="display: none;" aria-hidden="true"></canvas>
                </div>
                
                <div class="camera-buttons" role="group" aria-label="Kontrol kamera">
                  <button type="button" id="capture-button" class="capture-button" aria-describedby="capture-help">
                    Ambil Foto
                  </button>
                  <button type="button" id="recapture-button" class="recapture-button" style="display: none;" aria-describedby="recapture-help">
                    Ambil Ulang
                  </button>
                  <div id="capture-help" class="help-text">Klik untuk mengambil foto dari kamera</div>
                  <div id="recapture-help" class="help-text">Klik untuk mengambil foto ulang</div>
                </div>
                
                <div id="preview-container" class="preview-container" style="display: none;">
                  <img id="photo-preview" alt="Preview foto yang telah diambil" class="photo-preview">
                </div>
              </div>
            </fieldset>
            
            <fieldset class="form-group map-section">
              <legend>Pilih Lokasi *</legend>
              <p id="map-instructions">Klik pada peta di bawah untuk menentukan lokasi cerita Anda</p>
              <div 
                id="map" 
                class="location-map" 
                role="img" 
                aria-label="Peta interaktif untuk memilih lokasi"
                aria-describedby="map-instructions"
              ></div>
              <div class="selected-location" role="status" aria-live="polite">
                <p>Koordinat yang dipilih: <span id="selected-coords" aria-label="Koordinat lokasi yang dipilih">Belum dipilih</span></p>
              </div>
            </fieldset>
            
            <button type="submit" id="submit-button" disabled aria-describedby="submit-help">
              Kirim Cerita
            </button>
            <div id="submit-help" class="help-text">Pastikan semua field telah diisi dengan benar sebelum mengirim</div>
          </form>
          
          <div id="status-container" class="status-container" role="status" aria-live="polite"></div>
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