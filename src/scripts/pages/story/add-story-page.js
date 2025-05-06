import StoryAPI from '../../data/story-api';
import ViewTransition from '../../utils/view-transition';
import CameraInitializer from '../../utils/camera-initializer';
import MapInitializer from '../../utils/map-initializer';
import AuthRepository from '../../data/auth-repository';

export default class AddStoryPage {
  constructor() {
    this.map = null;
    this.selectedLocation = {
      lat: -6.2,
      lng: 106.8
    };
    this.stream = null;
    this.photoBlob = null;
  }
  
  async render() {
    return `
      <div class="add-story-container container">
        <a href="#main-content" class="skip-link">Skip to content</a>
        
        <a href="#/" class="back-button" aria-label="Kembali ke halaman utama">
          <span>&larr;</span> Kembali
        </a>
        
        <main id="main-content">
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
    
    // Inisialisasi kamera
    const videoElement = document.getElementById('camera-preview');
    this.stream = await CameraInitializer.init({
      videoElement,
      errorCallback: (error) => {
        document.querySelector('.camera-section').innerHTML = `
          <div class="error-message">
            <p>Tidak dapat mengakses kamera: ${error.message}</p>
            <p>Silakan periksa izin kamera Anda.</p>
          </div>
        `;
      }
    });
    
    // Inisialisasi peta
    const mapContainer = document.getElementById('map');
    
    setTimeout(() => {
      this.map = MapInitializer.initMap(mapContainer);
      
      if (this.map) {
        // Buat layer grup untuk marker
        this.markersLayer = L.layerGroup().addTo(this.map);
        
        // Tambahkan event listener untuk klik pada peta
        MapInitializer.setupClickHandler(this.map, (lat, lng) => {
          // Update koordinat yang dipilih
          this.selectedLocation = { lat, lng };
          
          // Tampilkan koordinat
          document.getElementById('selected-coords').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          
          // Hapus marker sebelumnya
          this.markersLayer.clearLayers();
          
          // Tambahkan marker baru
          L.marker([lat, lng])
            .bindPopup('Lokasi cerita Anda')
            .addTo(this.markersLayer)
            .openPopup();
          
          // Validasi form
          this._validateForm();
        });
      }
    }, 100);
    
    // Setup event listeners untuk kamera
    const captureButton = document.getElementById('capture-button');
    const recaptureButton = document.getElementById('recapture-button');
    const canvasElement = document.getElementById('photo-canvas');
    const photoPreviewElement = document.getElementById('photo-preview');
    const previewContainer = document.getElementById('preview-container');
    
    captureButton.addEventListener('click', async () => {
      if (!this.stream) return;
      
      // Ambil foto
      this.photoBlob = await CameraInitializer.takePhoto(videoElement, canvasElement);
      
      // Tampilkan preview
      const photoUrl = URL.createObjectURL(this.photoBlob);
      photoPreviewElement.src = photoUrl;
      
      // Tampilkan preview dan tombol ambil ulang
      previewContainer.style.display = 'block';
      recaptureButton.style.display = 'inline-block';
      captureButton.style.display = 'none';
      
      // Validasi form
      this._validateForm();
    });
    
    recaptureButton.addEventListener('click', () => {
      // Reset
      this.photoBlob = null;
      photoPreviewElement.src = '';
      
      // Sembunyikan preview dan tampilkan tombol ambil
      previewContainer.style.display = 'none';
      recaptureButton.style.display = 'none';
      captureButton.style.display = 'inline-block';
      
      // Validasi form
      this._validateForm();
    });
    
    // Setup form submission
    const form = document.getElementById('add-story-form');
    const statusContainer = document.getElementById('status-container');
    
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      // Tampilkan loading
      statusContainer.innerHTML = '<p class="loading">Mengirim cerita...</p>';
      
      try {
        // Buat FormData
        const formData = new FormData();
        
        // Tambahkan deskripsi
        const description = document.getElementById('description').value;
        formData.append('description', description);
        
        // Tambahkan foto
        if (this.photoBlob) {
          formData.append('photo', this.photoBlob, 'photo.jpg');
        } else {
          throw new Error('Silakan ambil foto terlebih dahulu.');
        }
        
        // Tambahkan lokasi jika ada
        if (this.selectedLocation.lat && this.selectedLocation.lng) {
          formData.append('lat', this.selectedLocation.lat);
          formData.append('lon', this.selectedLocation.lng);
        }
        
        // Kirim ke API
        const response = await StoryAPI.addNewStory(formData);
        
        // Tampilkan sukses
        statusContainer.innerHTML = '<p class="success">Cerita berhasil ditambahkan!</p>';
        
        // Redirect ke halaman utama setelah beberapa detik
        setTimeout(() => {
          // Bersihkan stream kamera
          if (this.stream) {
            CameraInitializer.stopStream(this.stream);
          }
          
          ViewTransition.transit(() => {
            window.location.hash = '#/';
          });
        }, 2000);
      } catch (error) {
        // Tampilkan error
        statusContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
      }
    });
    
    // Tambahkan event listener untuk deskripsi
    document.getElementById('description').addEventListener('input', () => {
      this._validateForm();
    });
  }
  
  _validateForm() {
    const form = document.getElementById('add-story-form');
    if (!form) {
      console.error('Form element not found!');
      return false;
    }
    
    const isValid = form.checkValidity();
    const submitButton = document.getElementById('submit-button');
    
    // Cek apakah sudah ada foto
    const hasPhoto = this.photoBlob !== null;
    
    // Cek apakah sudah ada lokasi
    const hasLocation = this.selectedLocation && 
                        this.selectedLocation.lat && 
                        this.selectedLocation.lng;
    
    // Enable/disable tombol submit
    submitButton.disabled = !(isValid && hasPhoto && hasLocation);
    
    return isValid && hasPhoto && hasLocation;
  }
}