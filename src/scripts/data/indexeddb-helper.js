// IndexedDB Helper untuk StoryApp
class IndexedDBHelper {
  constructor() {
    this.dbName = 'StoryAppDB';
    this.dbVersion = 1;
    this.db = null;
  }

  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('IndexedDB: Error opening database');
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB: Database opened successfully');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('IndexedDB: Upgrading database');
        
        // Create stories store
        if (!db.objectStoreNames.contains('stories')) {
          const storiesStore = db.createObjectStore('stories', { 
            keyPath: 'id' 
          });
          storiesStore.createIndex('name', 'name', { unique: false });
          storiesStore.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('IndexedDB: Stories store created');
        }
        
        // Create favorites store
        if (!db.objectStoreNames.contains('favorites')) {
          const favoritesStore = db.createObjectStore('favorites', { 
            keyPath: 'id' 
          });
          favoritesStore.createIndex('dateAdded', 'dateAdded', { unique: false });
          console.log('IndexedDB: Favorites store created');
        }
        
        // Create offline actions store (for sync when back online)
        if (!db.objectStoreNames.contains('offlineActions')) {
          const offlineStore = db.createObjectStore('offlineActions', { 
            keyPath: 'id',
            autoIncrement: true 
          });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
          offlineStore.createIndex('type', 'type', { unique: false });
          console.log('IndexedDB: Offline actions store created');
        }
      };
    });
  }

  // Generic method to perform transactions
  async performTransaction(storeName, mode, operation) {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      
      transaction.oncomplete = () => {
        console.log(`IndexedDB: Transaction completed on ${storeName}`);
      };
      
      transaction.onerror = () => {
        console.error(`IndexedDB: Transaction failed on ${storeName}`, transaction.error);
        reject(transaction.error);
      };
      
      const request = operation(store);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Stories operations
  async addStory(story) {
    const storyWithTimestamp = {
      ...story,
      cachedAt: new Date().toISOString()
    };
    
    return this.performTransaction('stories', 'readwrite', (store) => {
      return store.put(storyWithTimestamp);
    });
  }

  async getStory(id) {
    return this.performTransaction('stories', 'readonly', (store) => {
      return store.get(id);
    });
  }

  async getAllStories() {
    return this.performTransaction('stories', 'readonly', (store) => {
      return store.getAll();
    });
  }

  async deleteStory(id) {
    return this.performTransaction('stories', 'readwrite', (store) => {
      return store.delete(id);
    });
  }

  async clearAllStories() {
    return this.performTransaction('stories', 'readwrite', (store) => {
      return store.clear();
    });
  }

  // Favorites operations
  async addToFavorites(story) {
    const favoriteStory = {
      ...story,
      dateAdded: new Date().toISOString()
    };
    
    return this.performTransaction('favorites', 'readwrite', (store) => {
      return store.put(favoriteStory);
    });
  }

  async removeFromFavorites(id) {
    return this.performTransaction('favorites', 'readwrite', (store) => {
      return store.delete(id);
    });
  }

  async getFavorites() {
    return this.performTransaction('favorites', 'readonly', (store) => {
      return store.getAll();
    });
  }

  async isFavorite(id) {
    const favorite = await this.performTransaction('favorites', 'readonly', (store) => {
      return store.get(id);
    });
    return !!favorite;
  }

  // Offline actions operations (for background sync)
  async addOfflineAction(action) {
    const actionWithTimestamp = {
      ...action,
      timestamp: new Date().toISOString()
    };
    
    return this.performTransaction('offlineActions', 'readwrite', (store) => {
      return store.add(actionWithTimestamp);
    });
  }

  async getOfflineActions() {
    return this.performTransaction('offlineActions', 'readonly', (store) => {
      return store.getAll();
    });
  }

  async removeOfflineAction(id) {
    return this.performTransaction('offlineActions', 'readwrite', (store) => {
      return store.delete(id);
    });
  }

  // Utility methods
  async getStorageUsage() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage,
          available: estimate.quota,
          percentage: Math.round((estimate.usage / estimate.quota) * 100)
        };
      }
    } catch (error) {
      console.warn('Storage estimation not available');
    }
    return null;
  }

  async cleanOldData(daysOld = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    // Clean old cached stories
    const stories = await this.getAllStories();
    const oldStories = stories.filter(story => {
      const cachedDate = new Date(story.cachedAt || story.createdAt);
      return cachedDate < cutoffDate;
    });
    
    for (const story of oldStories) {
      await this.deleteStory(story.id);
    }
    
    console.log(`IndexedDB: Cleaned ${oldStories.length} old stories`);
    return oldStories.length;
  }
}

// Create singleton instance
const indexedDBHelper = new IndexedDBHelper();

export default indexedDBHelper;