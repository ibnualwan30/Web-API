// src/scripts/mvp/view/add-story-view.js

export default class AddStoryView {
  constructor() {
    this._form = null;
    this._statusContainer = null;
    this._descriptionInput = null;
    this._cameraPreview = null;
    this._captureButton = null;
    this._recaptureButton = null;
    this._photoCanvas = null;
    this._photoPreview = null;
    this._previewContainer = null;
    this._mapContainer = null;
    
    this._stream = null;
    this._photoBlob = null;
    this._map = null;
    this._markersLayer = null;
    this._selectedLocation = { lat: null, lng: null };
    this._presenter = null;

    // Bind methods untuk event listeners
    this._handlePageUnload = this._handlePageUnload.bind(this);
    this._handleHashChange = this._handleHashChange.bind(this);
    this._handleBeforeUnload = this._handleBeforeUnload.bind(this);
  }

  // Metode untuk inisialisasi view
  initView(presenter) {
    this._presenter = presenter;
    
    // Initialize DOM elements
    this._form = document.getElementById('add-story-form');
    this._statusContainer = document.getElementById('status-container');
    this._descriptionInput = document.getElementById('description');
    this._cameraPreview = document.getElementById('camera-preview');
    this._captureButton = document.getElementById('capture-button');
    this._recaptureButton = document.getElementById('recapture-button');
    this._photoCanvas = document.getElementById('photo-canvas');
    this._photoPreview = document.getElementById('photo-preview');
    this._previewContainer = document.getElementById('preview-container');
    this._mapContainer = document.getElementById('map');
    
    // Inisialisasi tampilan
    this._setupCamera();
    this._setupMap();
    this._setupFormValidation();
    this._setupSubmitHandler();
    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Setup event untuk cleanup saat navigasi - DOM manipulation di view
    window.addEventListener('popstate', this._handlePageUnload);
    window.addEventListener('beforeunload', this._handleBeforeUnload);
    window.addEventListener('hashchange', this._handleHashChange);
  }

  _handlePageUnload() {
    this._cleanup();
  }

  _handleHashChange() {
    this._cleanup();
  }

  _handleBeforeUnload() {
    this._cleanup();
  }

  _cleanup() {
    // Panggil presenter untuk handle cleanup logic
    if (this._presenter && this._presenter.handleCleanup) {
      this._presenter.handleCleanup();
    }

    // Cleanup event listeners
    this._removeEventListeners();
  }

  _removeEventListeners() {
    window.removeEventListener('popstate', this._handlePageUnload);
    window.removeEventListener('beforeunload', this._handleBeforeUnload);
    window.removeEventListener('hashchange', this._handleHashChange);
  }
  
  _setupSubmitHandler() {
    if (!this._form) return;
    
    this._form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      try {
        // Buat FormData
        const formData = new FormData();
        
        // Tambahkan deskripsi
        formData.append('description', this._descriptionInput.value);
        
        // Tambahkan foto
        if (this._photoBlob) {
          formData.append('photo', this._photoBlob, 'photo.jpg');
        } else {
          throw new Error('Silakan ambil foto terlebih dahulu.');
        }
        
        // Tambahkan lokasi jika ada
        if (this._selectedLocation.lat && this._selectedLocation.lng) {
          formData.append('lat', this._selectedLocation.lat);
          formData.append('lon', this._selectedLocation.lng);
        }
        
        // Serahkan data ke presenter untuk diproses
        if (this._presenter) {
          await this._presenter.submitStory(formData);
        }
      } catch (error) {
        this.showError(error.message);
      }
    });
  }
  
  async _setupCamera() {
    try {
      if (!this._cameraPreview) return;
      
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
      });
      
      this._cameraPreview.srcObject = this._stream;
      
      // Setup event listeners untuk kamera
      if (this._captureButton) {
        this._captureButton.addEventListener('click', () => {
          this._capturePhoto();
        });
      }
      
      if (this._recaptureButton) {
        this._recaptureButton.addEventListener('click', () => {
          this._resetPhoto();
        });
      }
    } catch (error) {
      const cameraSection = document.querySelector('.camera-section');
      if (cameraSection) {
        cameraSection.innerHTML = `
          <div class="error-message">
            <p>Tidak dapat mengakses kamera: ${error.message}</p>
            <p>Silakan periksa izin kamera Anda.</p>
          </div>
        `;
      }
    }
  }
  
  _setupMap() {
    if (!window.L || !this._mapContainer) {
      console.error('Leaflet tidak tersedia atau map container tidak ditemukan');
      return;
    }
    
    setTimeout(() => {
      try {
        // Buat instance peta
        this._map = L.map(this._mapContainer).setView([-2.5, 118], 5); // Center di Indonesia
        
        // Tambahkan tile layer OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(this._map);
        
        // Buat layer untuk marker
        this._markersLayer = L.layerGroup().addTo(this._map);
        
        // Tambahkan event listener untuk klik pada peta
        this._map.on('click', (event) => {
          const { lat, lng } = event.latlng;
          
          // Update koordinat yang dipilih
          this._selectedLocation = { lat, lng };
          
          // Tampilkan koordinat
          const selectedCoordsElement = document.getElementById('selected-coords');
          if (selectedCoordsElement) {
            selectedCoordsElement.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          }
          
          // Hapus marker sebelumnya
          this._markersLayer.clearLayers();
          
          // Tambahkan marker baru
          L.marker([lat, lng])
            .bindPopup('Lokasi cerita Anda')
            .addTo(this._markersLayer)
            .openPopup();
          
          // Validasi form
          this._validateForm();
        });
        
        // Pastikan peta diresize dengan benar
        setTimeout(() => {
          if (this._map) {
            this._map.invalidateSize();
          }
        }, 100);
      } catch (error) {
        console.error('Error inisialisasi peta:', error);
      }
    }, 100);
  }
  
  _setupFormValidation() {
    if (!this._descriptionInput) return;
    
    this._descriptionInput.addEventListener('input', () => {
      this._validateForm();
    });
  }
  
  _validateForm() {
    if (!this._form) return false;
    
    const isValid = this._form.checkValidity();
    const submitButton = document.getElementById('submit-button');
    if (!submitButton) return false;
    
    // Cek apakah sudah ada foto
    const hasPhoto = this._photoBlob !== null;
    
    // Cek apakah sudah ada lokasi
    const hasLocation = this._selectedLocation && 
                      this._selectedLocation.lat && 
                      this._selectedLocation.lng;
    
    // Enable/disable tombol submit
    submitButton.disabled = !(isValid && hasPhoto && hasLocation);
    
    return isValid && hasPhoto && hasLocation;
  }
  
  _capturePhoto() {
    if (!this._photoCanvas || !this._cameraPreview || !this._captureButton || !this._recaptureButton) return;
    
    const context = this._photoCanvas.getContext('2d');
    
    // Set ukuran canvas sesuai dengan video
    this._photoCanvas.width = this._cameraPreview.videoWidth;
    this._photoCanvas.height = this._cameraPreview.videoHeight;
    
    // Gambar frame dari video ke canvas
    context.drawImage(this._cameraPreview, 0, 0, this._photoCanvas.width, this._photoCanvas.height);
    
    // Konversi canvas ke blob
    this._photoCanvas.toBlob((blob) => {
      // Simpan blob untuk pengiriman nanti
      this._photoBlob = blob;
      
      // Tampilkan preview
      const imageUrl = URL.createObjectURL(blob);
      if (this._photoPreview) {
        this._photoPreview.src = imageUrl;
      }
      
      // Tampilkan preview dan tombol ambil ulang
      if (this._previewContainer) {
        this._previewContainer.style.display = 'block';
      }
      if (this._recaptureButton) {
        this._recaptureButton.style.display = 'inline-block';
      }
      if (this._captureButton) {
        this._captureButton.style.display = 'none';
      }
      
      // Validasi form
      this._validateForm();
    }, 'image/jpeg', 0.8);
  }
  
  _resetPhoto() {
    // Reset
    this._photoBlob = null;
    if (this._photoPreview) {
      this._photoPreview.src = '';
    }
    
    // Sembunyikan preview dan tampilkan tombol ambil
    if (this._previewContainer) {
      this._previewContainer.style.display = 'none';
    }
    if (this._recaptureButton) {
      this._recaptureButton.style.display = 'none';
    }
    if (this._captureButton) {
      this._captureButton.style.display = 'inline-block';
    }
    
    // Validasi form
    this._validateForm();
  }
  
  stopCameraStream() {
    if (this._stream) {
      this._stream.getTracks().forEach((track) => {
        track.stop();
      });
      this._stream = null;
    }
  }
  
  showLoading() {
    if (this._statusContainer) {
      this._statusContainer.innerHTML = '<p class="loading">Mengirim cerita...</p>';
    }
  }
  
  showSuccess(message) {
    if (this._statusContainer) {
      this._statusContainer.innerHTML = `<p class="success">${message}</p>`;
    }
  }
  
  showError(message) {
    if (this._statusContainer) {
      this._statusContainer.innerHTML = `<p class="error">Error: ${message}</p>`;
    }
  }
  
  redirectToHome() {
    // Cleanup sebelum berpindah halaman
    this._cleanup();
    
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
    // Cleanup sebelum berpindah halaman
    this._cleanup();
    
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