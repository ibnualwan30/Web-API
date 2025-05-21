export default class AddStoryPresenter {
  constructor({ view, storyModel, authModel }) {
    this._view = view;
    this._storyModel = storyModel;
    this._authModel = authModel;

    this._handlePageUnload = this._handlePageUnload.bind(this);
    this.init();
  }

  init() {
    // Inisialisasi view
    this._view.initView(this);
    
    // Setup event untuk cleanup saat navigasi
    window.addEventListener('popstate', this._handlePageUnload);
    window.addEventListener('beforeunload', this._handlePageUnload);
    window.addEventListener('hashchange', this._handlePageUnload);
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

  _handlePageUnload() {
    // Beri tahu view untuk menghentikan kamera
    this._view.stopCameraStream();

    // Bersihkan event listener
    window.removeEventListener('popstate', this._handlePageUnload);
    window.removeEventListener('beforeunload', this._handlePageUnload);
    window.removeEventListener('hashchange', this._handlePageUnload);
  }
}