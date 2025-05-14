// src/scripts/mvp/presenter/AddStoryPresenter.js

export default class AddStoryPresenter {
  constructor({ view, storyModel, authModel }) {
    this._view = view;
    this._storyModel = storyModel;
    this._authModel = authModel;

    this._handlePageUnload = this._handlePageUnload.bind(this); // penting agar bisa remove listener
    this.init();
  }

  init() {
    if (!this._authModel.isAuthenticated()) {
      this._view.redirectToLogin();
      return;
    }

    this._view.setSubmitHandler(this.submitStory.bind(this));
    
    // ✅ Tambahkan listener untuk stop kamera ketika keluar dari halaman
    window.addEventListener('popstate', this._handlePageUnload);
    window.addEventListener('beforeunload', this._handlePageUnload);
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
    // ✅ Fungsi untuk menghentikan kamera
    const video = document.querySelector('video');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }

    // Optional: bersihkan event listener agar tidak menumpuk jika halaman dimuat ulang
    window.removeEventListener('popstate', this._handlePageUnload);
    window.removeEventListener('beforeunload', this._handlePageUnload);
  }
}
