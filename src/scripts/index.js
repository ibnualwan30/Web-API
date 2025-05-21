// src/scripts/index.js (Flow Login First)

// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import AuthRepository from './data/auth-repository';

// Fungsi untuk memperbarui tampilan navigasi auth
const updateAuthNavigation = () => {
  const isLoggedIn = AuthRepository.isAuthenticated();
  const authNotLoggedElements = document.querySelectorAll('.auth-not-logged');
  const authLoggedElements = document.querySelectorAll('.auth-logged');

  // Tampilkan/sembunyikan elemen berdasarkan status login
  authNotLoggedElements.forEach(element => {
    element.style.display = isLoggedIn ? 'none' : 'block';
  });

  authLoggedElements.forEach(element => {
    element.style.display = isLoggedIn ? 'block' : 'none';
  });

  // Setup event listener untuk tombol logout di navigasi
  const navLogoutButton = document.getElementById('nav-logout-button');
  if (navLogoutButton) {
    navLogoutButton.addEventListener('click', () => {
      AuthRepository.clearToken();
      window.location.hash = '#/login';
      updateAuthNavigation();
    });
  }
};

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
  
  // Update navigasi auth berdasarkan status login
  updateAuthNavigation();
  
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  // Redirect ke halaman login jika belum login dan belum di halaman login/register
  if (!AuthRepository.isAuthenticated()) {
    const currentHash = window.location.hash;
    if (currentHash !== '#/login' && currentHash !== '#/register' && currentHash !== '#/about') {
      window.location.hash = '#/login';
    }
  }
  
  // Cek otentikasi dan render halaman
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    // Update navigasi auth pada setiap perubahan halaman
    updateAuthNavigation();
    await app.renderPage();
  });
});