// src/scripts/index.js - PWA Enhanced

// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import AuthRepository from './data/auth-repository';
import indexedDBHelper from './data/indexeddb-helper';
import pushNotificationHelper from './utils/push-notification';

// PWA Variables
let deferredPrompt;
let installBanner;
let notificationBanner;

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

// Register Service Worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            showUpdateAvailable();
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('Service Worker not supported');
    return null;
  }
};

// Show update available notification
const showUpdateAvailable = () => {
  const updateBanner = document.createElement('div');
  updateBanner.className = 'update-banner';
  updateBanner.innerHTML = `
    <div class="update-banner-content">
      <p>Pembaruan aplikasi tersedia!</p>
      <button id="refresh-app">Perbarui Sekarang</button>
      <button id="dismiss-update">Nanti</button>
    </div>
  `;
  
  document.body.appendChild(updateBanner);
  
  document.getElementById('refresh-app').addEventListener('click', () => {
    window.location.reload();
  });
  
  document.getElementById('dismiss-update').addEventListener('click', () => {
    updateBanner.remove();
  });
};

// Setup PWA Install Banner
const setupInstallBanner = () => {
  installBanner = document.getElementById('install-banner');
  
  if (!installBanner) {
    console.warn('Install banner element not found');
    return;
  }
  
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('PWA: beforeinstallprompt fired');
    
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    event.preventDefault();
    
    // Store the event so it can be triggered later
    deferredPrompt = event;
    
    // Show install banner
    installBanner.style.display = 'block';
  });
  
  // Install button click handler
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA install outcome:', outcome);
        
        // Clear the deferredPrompt
        deferredPrompt = null;
        
        // Hide the install banner
        installBanner.style.display = 'none';
      }
    });
  }
  
  // Dismiss install banner
  const dismissInstall = document.getElementById('dismiss-install');
  if (dismissInstall) {
    dismissInstall.addEventListener('click', () => {
      installBanner.style.display = 'none';
      
      // Don't show again for this session
      sessionStorage.setItem('installBannerDismissed', 'true');
    });
  }
  
  // Listen for app installed event
  window.addEventListener('appinstalled', (event) => {
    console.log('PWA: App installed successfully');
    installBanner.style.display = 'none';
    
    // Show success notification
    showInstallSuccessNotification();
  });
  
  // Check if already dismissed this session
  if (sessionStorage.getItem('installBannerDismissed')) {
    installBanner.style.display = 'none';
  }
};

// Setup Push Notification Banner
const setupNotificationBanner = () => {
  notificationBanner = document.getElementById('notification-banner');
  
  if (!notificationBanner) {
    console.warn('Notification banner element not found');
    return;
  }
  
  // Check if notifications are supported and not already granted
  if (pushNotificationHelper.isNotificationSupported()) {
    const permission = pushNotificationHelper.getPermissionStatus();
    
    if (permission === 'default' && !localStorage.getItem('notificationBannerDismissed')) {
      // Show notification banner after a delay
      setTimeout(() => {
        notificationBanner.style.display = 'block';
      }, 5000);
    }
  }
  
  // Enable notifications button
  const enableButton = document.getElementById('enable-notifications');
  if (enableButton) {
    enableButton.addEventListener('click', async () => {
      try {
        const granted = await pushNotificationHelper.requestPermission();
        
        if (granted) {
          await pushNotificationHelper.subscribetoPush();
          notificationBanner.style.display = 'none';
          
          // Show success notification
          pushNotificationHelper.showLocalNotification(
            'Notifikasi Diaktifkan!',
            {
              body: 'Anda akan menerima pemberitahuan tentang cerita terbaru.',
              tag: 'notification-enabled'
            }
          );
        } else {
          alert('Izin notifikasi diperlukan untuk fitur ini.');
        }
      } catch (error) {
        console.error('Error enabling notifications:', error);
        alert('Gagal mengaktifkan notifikasi.');
      }
    });
  }
  
  // Dismiss notifications button
  const dismissButton = document.getElementById('dismiss-notifications');
  if (dismissButton) {
    dismissButton.addEventListener('click', () => {
      notificationBanner.style.display = 'none';
      localStorage.setItem('notificationBannerDismissed', 'true');
    });
  }
};

// Show install success notification
const showInstallSuccessNotification = () => {
  const notification = document.createElement('div');
  notification.className = 'install-success-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <h4>✅ Aplikasi Berhasil Diinstall!</h4>
      <p>StoryApp sekarang dapat diakses dari homescreen Anda.</p>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
};

// Enhanced Service Worker Setup
const setupServiceWorkerUpdates = async () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SKIP_WAITING') {
        // Reload halaman ketika service worker baru siap
        window.location.reload();
      }
    });
  }
};

// GANTI FUNGSI testPushNotification dengan ini (COMPLETE VERSION):
const testPushNotification = async () => {
  // Test server push notification setelah 15 detik
  setTimeout(async () => {
    if (pushNotificationHelper.getPermissionStatus() === 'granted') {
      try {
        // SIMULASI SERVER PUSH via Service Worker Message
        const registration = await navigator.serviceWorker.ready;
        
        registration.active.postMessage({
          type: 'SIMULATE_PUSH',
          payload: {
            title: 'StoryApp - Server Push!',
            body: 'Push notification dari server (background thread)',
            icon: '/icons/icon-192x192.png'
          }
        });
        
        console.log('✅ Server push simulation sent to Service Worker');
      } catch (error) {
        console.error('Failed to simulate server push:', error);
      }
    }
  }, 15000);

  // TAMBAHAN: Periodic check untuk demo (setiap 5 menit)
  setInterval(async () => {
    if (pushNotificationHelper.getPermissionStatus() === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        const randomMessages = [
          'Ada cerita baru dari Jakarta!',
          'Cerita menarik dari Bali baru saja ditambahkan!',
          'Seseorang berbagi cerita dari Yogyakarta!'
        ];
        
        const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        
        registration.active.postMessage({
          type: 'SIMULATE_PUSH',
          payload: {
            title: 'StoryApp - Cerita Baru!',
            body: randomMessage,
            icon: '/icons/icon-192x192.png'
          }
        });
        
        console.log('✅ Periodic server push sent');
      } catch (error) {
        console.error('Failed periodic server push:', error);
      }
    }
  }, 300000); 
};


const initializePWA = async () => {
  console.log('Initializing PWA features...');
  
  // Register Service Worker
  await registerServiceWorker();
  
  // Setup service worker updates
  await setupServiceWorkerUpdates();
  
  // Initialize IndexedDB
  try {
    await indexedDBHelper.init();
    console.log('IndexedDB initialized successfully');
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
  }
  
  // Initialize Push Notifications
  try {
    await pushNotificationHelper.initialize();
    console.log('Push notifications initialized');
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
  
  // Setup install banner
  setupInstallBanner();
  
  // Setup notification banner
  setupNotificationBanner();
  
  // Test push notification - BARU!
  testPushNotification();
  
  console.log('PWA features initialized');
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

// Check network status
const setupNetworkStatusHandler = () => {
  const showNetworkStatus = (isOnline) => {
    const existingBanner = document.querySelector('.network-status-banner');
    if (existingBanner) {
      existingBanner.remove();
    }
    
    if (!isOnline) {
      const offlineBanner = document.createElement('div');
      offlineBanner.className = 'network-status-banner offline';
      offlineBanner.innerHTML = `
        <div class="network-status-content">
          <span>📡 Mode Offline - Data mungkin tidak terbaru</span>
        </div>
      `;
      document.body.appendChild(offlineBanner);
    }
  };
  
  // Initial check
  showNetworkStatus(navigator.onLine);
  
  // Listen for network changes
  window.addEventListener('online', () => {
    console.log('Network: Back online');
    showNetworkStatus(true);
  });
  
  window.addEventListener('offline', () => {
    console.log('Network: Gone offline');
    showNetworkStatus(false);
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded');
  
  // Initialize PWA features first
  await initializePWA();
  
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
  
  // Setup network status handler
  setupNetworkStatusHandler();
  
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
    if (currentHash !== '#/login' && currentHash !== '#/register' && currentHash !== '#/about' && currentHash !== '#/favorites') {
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