

export default class HomePresenter {
    constructor({ view, storyModel, authModel }) {
      this._view = view;
      this._storyModel = storyModel;
      this._authModel = authModel;
      
      this.init();
    }
  
    async init() {
      // Periksa otentikasi
      if (!this._authModel.isAuthenticated()) {
        this._view.redirectToLogin();
        return;
      }
      
      // Setup event handler logout
      this._view.setLogoutHandler(() => {
        this._authModel.logout();
        this._view.redirectToLogin();
      });
      
      // Load stories
      await this.loadStories();
    }
  
    async loadStories() {
      try {
        const stories = await this._storyModel.getAllStories();
        
        if (stories.length === 0) {
          this._view.showEmptyState();
          return;
        }
        
        this._view.showStories(stories);
        this._view.initializeMap(stories);
      } catch (error) {
        this._view.showError(error.message);
      }
    }
  }