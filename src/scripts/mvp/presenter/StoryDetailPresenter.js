// src/scripts/mvp/presenter/StoryDetailPresenter.js

export default class StoryDetailPresenter {
    constructor({ view, storyModel, authModel, storyId }) {
      this._view = view;
      this._storyModel = storyModel;
      this._authModel = authModel;
      this._storyId = storyId;
      
      this.init();
    }
  
    async init() {
      // Periksa otentikasi
      if (!this._authModel.isAuthenticated()) {
        this._view.redirectToLogin();
        return;
      }
      
      if (!this._storyId) {
        this._view.redirectToHome();
        return;
      }
      
      await this.loadStoryDetail();
    }
  
    async loadStoryDetail() {
      try {
        const story = await this._storyModel.getStoryDetail(this._storyId);
        
        if (!story) {
          this._view.showError('Story not found');
          return;
        }
        
        this._view.showStoryDetail(story);
        
        // Inisialisasi peta jika story memiliki lokasi
        if (story.lat && story.lon) {
          this._view.initializeMap(story);
        } else {
          this._view.hideMap();
        }
      } catch (error) {
        this._view.showError(`Error loading story: ${error.message}`);
      }
    }
  }