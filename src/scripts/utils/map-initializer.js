import CONFIG from '../config';

const MapInitializer = {
  initMap(containerElement, lat = CONFIG.DEFAULT_MAP_CENTER[0], lng = CONFIG.DEFAULT_MAP_CENTER[1], zoom = CONFIG.DEFAULT_MAP_ZOOM) {
    // Pastikan container element ada
    if (!containerElement) {
      console.error('Container element tidak ditemukan');
      return null;
    }
    
    // Pastikan leaflet sudah diload
    if (!window.L) {
      console.error('Leaflet tidak tersedia');
      return null;
    }
    
    try {
      // Buat instance peta
      const map = L.map(containerElement).setView([lat, lng], zoom);
      
      // Tambahkan tile layer OpenStreetMap (gratis dan tanpa API key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      
      // Pastikan peta diresize dengan benar saat container berubah
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
      
      return map;
    } catch (error) {
      console.error('Error inisialisasi peta Leaflet:', error);
      return null;
    }
  },
  
  addMarker(map, lat, lng, popupText = '') {
    if (!map) return null;
    
    try {
      // Buat marker
      const marker = L.marker([lat, lng]).addTo(map);
      
      // Tambahkan popup jika ada
      if (popupText) {
        marker.bindPopup(popupText).openPopup();
      }
      
      return marker;
    } catch (error) {
      console.error('Error menambahkan marker:', error);
      return null;
    }
  },
  
  // Fungsi untuk menangani klik pada peta (untuk pemilihan lokasi)
  setupClickHandler(map, callback) {
    if (!map || !callback) return;
    
    map.on('click', (event) => {
      const { lat, lng } = event.latlng;
      callback(lat, lng);
    });
  },
  
  // Clear semua marker pada peta
  clearMarkers(map, markersLayer) {
    if (markersLayer) {
      markersLayer.clearLayers();
    }
    return L.layerGroup().addTo(map);
  }
};

export default MapInitializer;