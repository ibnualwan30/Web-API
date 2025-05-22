// src/scripts/index.js (Fixed Clean Navigation)

// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import AuthRepository from './data/auth-repository';

// Fungsi untuk memperbarui tampilan navigasi auth
const updateAuthNavigation = () => {
  const isLoggedIn = AuthRepository.isAuthenticated();
  const authNotLoggedElements = document.querySelectorAll('.auth-not-logged');
  const authLoggedElements = document.querySelectorAll('.auth-logged');

  // Update body class untuk styling
  if (isLoggedIn) {
    document.body.classList.add('logged-in');
  } else {
    document.body.classList.remove('logged-in');
  }

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
    // Remove existing listeners to prevent duplicates
    const newButton = navLogoutButton.cloneNode(true);
    navLogoutButton.parentNode.replaceChild(newButton, navLogoutButton);
    
    newButton.addEventListener('click', () => {
      AuthRepository.clearToken();
      window.location.hash = '#/login';
      updateAuthNavigation();
      
      // Close mobile menu if open
      const navigationDrawer = document.getElementById('navigation-drawer');
      if (navigationDrawer) {
        navigationDrawer.classList.remove('open');
      }
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
      setTimeout(resolve, 100);
    };
    
    leafletScript.onerror = (error) => {
      console.error('Error loading Leaflet:', error);
      resolve();
    };
    
    document.head.appendChild(leafletScript);
  });
};

// Setup drawer functionality
const setupDrawer = () => {
  const drawerButton = document.querySelector('#drawer-button');
  const navigationDrawer = document.querySelector('#navigation-drawer');
  
  if (!drawerButton || !navigationDrawer) return;
  
  drawerButton.addEventListener('click', () => {
    navigationDrawer.classList.toggle('open');
  });

  // Close drawer when clicking outside
  document.addEventListener('click', (event) => {
    if (!navigationDrawer.contains(event.target) && !drawerButton.contains(event.target)) {
      navigationDrawer.classList.remove('open');
    }
  });

  // Close drawer when clicking on navigation links
  navigationDrawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navigationDrawer.classList.remove('open');
    });
  });

  // Close drawer on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigationDrawer.classList.contains('open')) {
      navigationDrawer.classList.remove('open');
      drawerButton.focus();
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded');
  
  // Load dependencies
  await loadLeafletScript();
  
  // Pastikan Leaflet sudah dimuat dengan benar
  if (window.L) {
    console.log('Leaflet loaded successfully');
  } else {
    console.warn('Failed to load Leaflet');
  }
  
  // Debug: Check if elements exist
  const content = document.querySelector('#main-content');
  const drawerButton = document.querySelector('#drawer-button');
  const navigationDrawer = document.querySelector('#navigation-drawer');
  
  console.log('Elements found:', {
    content: !!content,
    drawerButton: !!drawerButton,
    navigationDrawer: !!navigationDrawer
  });
  
  // Setup drawer functionality
  setupDrawer();
  
  // Update navigasi auth berdasarkan status login
  updateAuthNavigation();
  
  const app = new App({
    content: content,
    drawerButton: drawerButton,
    navigationDrawer: navigationDrawer,
  });
  
  console.log('App initialized');
  
  // Redirect ke halaman login jika belum login dan belum di halaman login/register
  if (!AuthRepository.isAuthenticated()) {
    const currentHash = window.location.hash;
    console.log('Not authenticated, current hash:', currentHash);
    if (currentHash !== '#/login' && currentHash !== '#/register' && currentHash !== '#/about') {
      console.log('Redirecting to login');
      window.location.hash = '#/login';
    }
  }
  
  // Cek otentikasi dan render halaman
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    console.log('Hash changed to:', window.location.hash);
    // Update navigasi auth pada setiap perubahan halaman
    updateAuthNavigation();
    await app.renderPage();
  });
});