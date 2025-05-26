// Push Notification Helper untuk StoryApp
import CONFIG from '../config';

class PushNotificationHelper {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.subscription = null;
  }

  // Check if push notifications are supported
  isNotificationSupported() {
    return this.isSupported && 'Notification' in window;
  }

  // Request permission for notifications
  async requestPermission() {
    if (!this.isNotificationSupported()) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Push notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.log('Push notification permission denied');
      return false;
    } else {
      console.log('Push notification permission dismissed');
      return false;
    }
  }

  // Get current permission status
  getPermissionStatus() {
    if (!this.isNotificationSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Subscribe to push notifications
  async subscribetoPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;
        console.log('Already subscribed to push notifications');
        return existingSubscription;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY)
      });

      this.subscription = subscription;
      console.log('Subscribed to push notifications:', subscription);

      // Send subscription to server
      await this.sendSubscriptionToserver(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;
        console.log('Unsubscribed from push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Send subscription to server
  async sendSubscriptionToserver(subscription) {
    try {
      // In a real app, you would send this to your backend
      // For demo purposes, we'll just log it
      console.log('Subscription to send to server:', JSON.stringify(subscription));
      
      // Example of how you might send it to your server:
      /*
      const response = await fetch(`${CONFIG.BASE_URL}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthRepository.getToken()}`
        },
        body: JSON.stringify(subscription)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
      */
      
      return true;
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      return false;
    }
  }

  // Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Show local notification (for testing)
  async showLocalNotification(title, options = {}) {
    if (this.getPermissionStatus() !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    const defaultOptions = {
      body: 'Ini adalah notifikasi dari StoryApp',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      tag: 'storyapp-local',
      requireInteraction: false,
      data: {
        url: '/'
      }
    };

    const notificationOptions = { ...defaultOptions, ...options };

    try {
      const notification = new Notification(title, notificationOptions);
      
      notification.onclick = (event) => {
        console.log('Notification clicked', event);
        notification.close();
        
        // Focus window or open new tab
        if (window.focus) {
          window.focus();
        } else {
          window.open(notificationOptions.data.url, '_blank');
        }
      };

      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }

  // Initialize push notifications
  async initialize() {
    if (!this.isNotificationSupported()) {
      console.warn('Push notifications are not supported');
      return false;
    }

    try {
      // Check current permission
      const permission = this.getPermissionStatus();
      
      if (permission === 'granted') {
        // Try to get existing subscription
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          this.subscription = subscription;
          console.log('Push notifications already initialized');
        }
        
        return true;
      } else if (permission === 'default') {
        // Permission not yet requested
        console.log('Push notification permission not yet requested');
        return false;
      } else {
        // Permission denied
        console.log('Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Get subscription status
  async getSubscriptionStatus() {
    try {
      if (!this.isNotificationSupported()) {
        return { supported: false, subscribed: false, permission: 'unsupported' };
      }

      const permission = this.getPermissionStatus();
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      return {
        supported: true,
        subscribed: !!subscription,
        permission: permission,
        subscription: subscription
      };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return { supported: false, subscribed: false, permission: 'error' };
    }
  }
}

// Create singleton instance
const pushNotificationHelper = new PushNotificationHelper();

export default pushNotificationHelper;