export default class AddStoryPresenter {
  constructor({ view, storyModel, authModel }) {
    this._view = view;
    this._storyModel = storyModel;
    this._authModel = authModel;

    this.init();
  }

  init() {
    if (!this._authModel.isAuthenticated()) {
      this._view.redirectToLogin();
      return;
    }

    // Serahkan semua setup UI dan event handling ke view
    this._view.initView(this);
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

  // Metode untuk memberitahu view bahwa navigasi terjadi
  onNavigate() {
    this._view.stopCameraStream();
  }
}