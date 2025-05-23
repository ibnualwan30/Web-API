// src/scripts/mvp/presenter/HomePresenter.js

export default class HomePresenter {
  constructor({ view, storyModel, authModel }) {
    this._view = view;
    this._storyModel = storyModel;
    this._authModel = authModel;
    
    this.init();
  }

  async init() {
    // Inisialisasi view dengan presenter
    this._view.initView(this);
    
    // Load stories hanya jika terautentikasi
    if (this._authModel.isAuthenticated()) {
      await this.loadStories();
    }
  }

  async loadStories() {
    try {
      this._view.showLoading();
      const stories = await this._storyModel.getAllStories();
      
      if (stories.length === 0) {
        this._view.showEmptyState();
        return;
      }
      
      this._view.showStories(stories);
    } catch (error) {
      this._view.showError(error.message);
    }
  }

  handleLogout() {
    this._authModel.logout();
    this._view.redirectToLogin();
  }
}