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
    
    this._view.initView(this);
    await this.loadStoryDetail();
  }

  async loadStoryDetail() {
    try {
      this._view.showLoading();
      const story = await this._storyModel.getStoryDetail(this._storyId);
      
      if (!story) {
        this._view.showError('Story not found');
        return;
      }
      
      this._view.showStoryDetail(story);
      
      // Biarkan view menangani tampilan peta berdasarkan data story
      if (story.lat && story.lon) {
        this._view.showMap(story);
      } else {
        this._view.hideMap();
      }
    } catch (error) {
      this._view.showError(`Error loading story: ${error.message}`);
    }
  }
}