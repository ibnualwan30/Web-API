// src/scripts/mvp/presenter/AddStoryPresenter.js

export default class AddStoryPresenter {
  constructor({ view, storyModel, authModel }) {
    this._view = view;
    this._storyModel = storyModel;
    this._authModel = authModel;

    this.init();
  }

  init() {
    // Inisialisasi view dengan presenter
    this._view.initView(this);
    
    // Setup event listeners untuk cleanup akan ditangani oleh view
    // Tidak ada DOM manipulation di presenter
  }

  async submitStory(formData) {
    try {
      this._view.showLoading();
      const response = await this._storyModel.addNewStory(formData);

      this._view.showSuccess('Cerita berhasil ditambahkan!');

      setTimeout(() => {
        this._view.redirectToHome();
      }, 2000);

      return response;
    } catch (error) {
      this._view.showError(error.message);
      throw error;
    }
  }

  // Method ini akan dipanggil oleh view saat cleanup diperlukan
  handleCleanup() {
    // Beri tahu view untuk menghentikan kamera
    this._view.stopCameraStream();
  }
}