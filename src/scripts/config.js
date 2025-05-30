const CONFIG = {
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  AUTH_KEY: 'storyapp_auth_key',
  DEFAULT_MAP_CENTER: [-6.2, 106.8], // Jakarta, Indonesia
  DEFAULT_MAP_ZOOM: 5,
  
  // VAPID Public Key untuk Push Notification
  // Ganti dengan VAPID public key dari Story API Dicoding
  VAPID_PUBLIC_KEY: 'BKMHuSQwTEMuBrs-vD3rI5AoYaJCc_QRcdpvIbbgzc0aRWi_c85JAjCX4lOtz_9K3QYucMjVACDcJB-H4g5RwuY',
  
  // PWA Settings
  CACHE_NAME: 'storyapp-v1',
  CACHE_VERSION: 1,
  
  // IndexedDB Settings
  DB_NAME: 'StoryAppDB',
  DB_VERSION: 1,
  
  // Notification Settings
  NOTIFICATION_ICON: '/icons/icon-192x192.png',
  NOTIFICATION_BADGE: '/icons/icon-72x72.png',
  
  // App Info
  APP_NAME: 'StoryApp',
  APP_SHORT_NAME: 'StoryApp',
  APP_DESCRIPTION: 'Aplikasi berbagi cerita dengan lokasi geografis'
};

export default CONFIG;