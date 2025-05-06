import { addStory } from '../../data/api';

export default class AddStoryPage {
  constructor() {
    this._imageFile = null;
    this._imagePreview = null;
    this._location = {
      lat: null,
      lon: null
    };
    this._mapInstance = null;
    this._marker = null;
  }

  async render() {
    return `
      <section class="container">
        <h1>Tambah Cerita Baru</h1>
        <p>Bagikan cerita dan lokasimu dengan dunia</p>
        
        <form id="addStoryForm" class="add-story-form">
          <div class="form-group">
            <label for="description">Cerita</label>
            <textarea id="description" name="description" rows="4" required placeholder="Ceritakan pengalamanmu..."></textarea>
          </div>
          
          <div class="form-group">
            <label for="photoFile">Foto</label>
            <div class="photo-capture">
              <div class="photo-preview">
                <img id="photoPreview" src="https://via.placeholder.com/400x300?text=Ambil+foto" alt="Preview foto yang akan diunggah">
              </div>
              <div class="photo-actions">
                <button type="button" id="takePictureBtn" class="btn btn-primary">Ambil Foto dengan Kamera</button>
                <input type="file" id="photoFile" name="photoFile" accept="image/*" capture="environment" hidden>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="location">Lokasi (Klik pada peta untuk menentukan lokasi)</label>
            <div id="locationMap" class="location-map"></div>
            <div class="location-info">
              <p>Koordinat yang dipilih:</p>
              <p id="selectedCoordinates" class="coordinates">Belum dipilih</p>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" id="submitButton" class="btn btn-submit">Kirim Cerita</button>
          </div>
        </form>
      </section>
      
      <!-- Modal kamera -->
      <div id="cameraModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Ambil Foto</h2>
            <button type="button" class="close-button" id="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <video id="cameraPreview" autoplay playsinline></video>
            <canvas id="cameraCanvas" style="display: none;"></canvas>
            <div class="camera-controls">
              <button type="button" id="captureButton" class="btn btn-capture">
                <i class="fas fa-camera"></i> Ambil
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this._initMap();
    this._initCameraModal();
    this._initFormSubmission();
  }
  
  _initMap() {
    const mapContainer = document.getElementById('locationMap');
    
    // Inisialisasi peta dengan Leaflet
    this._mapInstance = L.map(mapContainer).setView([-2.5489, 118.0149], 5); // Centered on Indonesia
    
    // Tambahkan tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this._mapInstance);
    
    // Tambahkan event listener untuk klik pada peta
    this._mapInstance.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      // Simpan lokasi
      this._location.lat = lat;
      this._location.lon = lng;
      
      // Update tampilan koordinat
      this._updateCoordinatesDisplay();
      
      // Tambahkan atau pindahkan marker
      if (this._marker) {
        this._marker.setLatLng([lat, lng]);
      } else {
        this._marker = L.marker([lat, lng]).addTo(this._mapInstance);
      }
    });
    
    // Sesuaikan ukuran peta setelah render
    setTimeout(() => {
      this._mapInstance.invalidateSize();
    }, 200);
  }
  
  _updateCoordinatesDisplay() {
    const coordinatesDisplay = document.getElementById('selectedCoordinates');
    
    if (this._location.lat && this._location.lon) {
      coordinatesDisplay.textContent = `Latitude: ${this._location.lat.toFixed(6)}, Longitude: ${this._location.lon.toFixed(6)}`;
      coordinatesDisplay.classList.add('selected');
    } else {
      coordinatesDisplay.textContent = 'Belum dipilih';
      coordinatesDisplay.classList.remove('selected');
    }
  }
  
  _initCameraModal() {
    const modal = document.getElementById('cameraModal');
    const openButton = document.getElementById('takePictureBtn');
    const closeButton = document.getElementById('closeModal');
    const captureButton = document.getElementById('captureButton');
    const videoElement = document.getElementById('cameraPreview');
    const canvasElement = document.getElementById('cameraCanvas');
    const photoPreview = document.getElementById('photoPreview');
    
    // Fungsi untuk memulai kamera
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Gunakan kamera belakang jika tersedia
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        
        videoElement.srcObject = stream;
        modal.classList.add('active');
      } catch (error) {
        console.error('Gagal mengakses kamera:', error);
        alert('Tidak dapat mengakses kamera. Pastikan kamera perangkat Anda berfungsi dan izin kamera telah diberikan.');
      }
    };
    
    // Fungsi untuk menghentikan kamera
    const stopCamera = () => {
      if (videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
      }
    };
    
    // Event listener untuk membuka modal dan memulai kamera
    openButton.addEventListener('click', startCamera);
    
    // Event listener untuk menutup modal dan menghentikan kamera
    closeButton.addEventListener('click', () => {
      stopCamera();
      modal.classList.remove('active');
    });
    
    // Event listener untuk mengambil foto
    captureButton.addEventListener('click', () => {
      // Set ukuran canvas sesuai dengan video
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      
      // Gambar frame dari video ke canvas
      const context = canvasElement.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      
      // Konversi canvas ke blob
      canvasElement.toBlob((blob) => {
        // Simpan blob untuk pengiriman nanti
        this._imageFile = blob;
        
        // Tampilkan preview
        const imageUrl = URL.createObjectURL(blob);
        photoPreview.src = imageUrl;
        
        // Tutup modal dan hentikan kamera
        stopCamera();
        modal.classList.remove('active');
      }, 'image/jpeg', 0.8);
    });
    
    // Alternative untuk fitur foto jika kamera tidak tersedia
    const fileInput = document.getElementById('photoFile');
    
    // Jika tombol kamera tidak tersedia, gunakan input file biasa
    openButton.addEventListener('click', (event) => {
      // Cek apakah API MediaDevices tersedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Kamera tidak didukung di perangkat ini. Silakan pilih file gambar.');
        fileInput.click();
        event.preventDefault();
      }
    });
    
    // Handler untuk input file
    fileInput.addEventListener('change', (event) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        
        // Simpan file untuk pengiriman nanti
        this._imageFile = file;
        
        // Tampilkan preview
        const imageUrl = URL.createObjectURL(file);
        photoPreview.src = imageUrl;
      }
    });
  }
  
  _initFormSubmission() {
    const form = document.getElementById('addStoryForm');
    
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      // Validasi form
      if (!this._imageFile) {
        alert('Silakan ambil foto terlebih dahulu.');
        return;
      }
      
      const description = document.getElementById('description').value;
      if (!description) {
        alert('Silakan masukkan deskripsi cerita.');
        return;
      }
      
      try {
        // Tampilkan loading state
        const submitButton = document.getElementById('submitButton');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Mengirim...';
        submitButton.disabled = true;
        
        // Persiapkan data cerita
        const storyData = {
          description,
          photo: this._imageFile,
        };
        
        // Tambahkan lokasi jika tersedia
        if (this._location.lat && this._location.lon) {
          storyData.lat = this._location.lat;
          storyData.lon = this._location.lon;
        }
        
        // Kirim data ke API
        const result = await addStory(storyData);
        
        // Tampilkan pesan sukses
        alert('Cerita berhasil ditambahkan!');
        
        // Redirect ke halaman utama
        window.location.hash = '#/';
      } catch (error) {
        console.error('Gagal menambahkan cerita:', error);
        alert(`Gagal menambahkan cerita: ${error.message}`);
        
        // Kembalikan state tombol
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    });
  }
}