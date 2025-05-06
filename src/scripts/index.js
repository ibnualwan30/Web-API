// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import AuthRepository from './data/auth-repository';

// Load Leaflet (via CDN)
const loadLeafletScript = () => {
  return new Promise((resolve) => {
    if (window.L) {
      resolve();
      return;
    }

    // Load CSS terlebih dahulu
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    leafletCSS.crossOrigin = '';
    document.head.appendChild(leafletCSS);

    // Kemudian load JavaScript
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    leafletScript.crossOrigin = '';
    
    leafletScript.onload = () => {
      console.log('Leaflet loaded successfully');
      setTimeout(resolve, 100); // Berikan waktu untuk menginisialisasi
    };
    
    leafletScript.onerror = (error) => {
      console.error('Error loading Leaflet:', error);
      resolve(); // Resolve anyway to avoid hanging
    };
    
    document.head.appendChild(leafletScript);
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  // Load dependencies
  await loadLeafletScript();
  
  // Pastikan Leaflet sudah dimuat dengan benar
  if (window.L) {
    console.log('Leaflet loaded successfully');
  } else {
    console.warn('Failed to load Leaflet');
  }
  
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  // Cek otentikasi dan render halaman
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});