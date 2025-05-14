// src/scripts/mvp/view/add-story-view.js

export default class AddStoryView {
    constructor() {
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
      
      this._stream = null;
      this._photoBlob = null;
      this._map = null;
      this._markersLayer = null;
      this._selectedLocation = { lat: null, lng: null };
      
      // Inisialisasi tampilan
      this._setupCamera();
      this._setupMap();
      this._setupFormValidation();
      
      // Menambahkan event handler untuk cleanup kamera ketika halaman ditinggalkan
      window.addEventListener('hashchange', () => {
        this.stopCameraStream();
      });
      
      // Juga hentikan kamera jika halaman/tab ditutup
      window.addEventListener('beforeunload', () => {
        this.stopCameraStream();
      });
    }
  
    setSubmitHandler(handler) {
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
          
          await handler(formData);
        } catch (error) {
          this.showError(error.message);
        }
      });
    }
  
    async _setupCamera() {
      try {
        this._stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
          },
        });
        
        this._cameraPreview.srcObject = this._stream;
        
        // Setup event listeners untuk kamera
        this._captureButton.addEventListener('click', () => {
          this._capturePhoto();
        });
        
        this._recaptureButton.addEventListener('click', () => {
          this._resetPhoto();
        });
      } catch (error) {
        document.querySelector('.camera-section').innerHTML = `
          <div class="error-message">
            <p>Tidak dapat mengakses kamera: ${error.message}</p>
            <p>Silakan periksa izin kamera Anda.</p>
          </div>
        `;
      }
    }
  
    _setupMap() {
      if (!window.L) {
        console.error('Leaflet tidak tersedia');
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
            document.getElementById('selected-coords').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            
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
            this._map.invalidateSize();
          }, 100);
        } catch (error) {
          console.error('Error inisialisasi peta:', error);
        }
      }, 100);
    }
  
    _setupFormValidation() {
      this._descriptionInput.addEventListener('input', () => {
        this._validateForm();
      });
    }
  
    _validateForm() {
      const isValid = this._form.checkValidity();
      const submitButton = document.getElementById('submit-button');
      
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
        this._photoPreview.src = imageUrl;
        
        // Tampilkan preview dan tombol ambil ulang
        this._previewContainer.style.display = 'block';
        this._recaptureButton.style.display = 'inline-block';
        this._captureButton.style.display = 'none';
        
        // Validasi form
        this._validateForm();
      }, 'image/jpeg', 0.8);
    }
  
    _resetPhoto() {
      // Reset
      this._photoBlob = null;
      this._photoPreview.src = '';
      
      // Sembunyikan preview dan tampilkan tombol ambil
      this._previewContainer.style.display = 'none';
      this._recaptureButton.style.display = 'none';
      this._captureButton.style.display = 'inline-block';
      
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
      this._statusContainer.innerHTML = '<p class="loading">Mengirim cerita...</p>';
    }
  
    showSuccess(message) {
      this._statusContainer.innerHTML = `<p class="success">${message}</p>`;
    }
  
    showError(message) {
      this._statusContainer.innerHTML = `<p class="error">Error: ${message}</p>`;
    }
  
    redirectToHome() {
      // Hentikan stream kamera sebelum berpindah halaman
      this.stopCameraStream();
      
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
      // Hentikan stream kamera sebelum berpindah halaman
      this.stopCameraStream();
      
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