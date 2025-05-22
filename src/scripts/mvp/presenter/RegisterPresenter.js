// src/scripts/mvp/presenter/RegisterPresenter.js

export default class RegisterPresenter {
  constructor({ view, authModel }) {
    this._view = view;
    this._authModel = authModel;
    
    this.init();
  }

  init() {
    // Inisialisasi view dengan presenter
    this._view.initView(this);
  }

  async register(name, email, password) {
    try {
      // Panggil API register melalui model
      const response = await this._authModel.register(name, email, password);
      console.log('Registrasi berhasil:', response);
      
      this._view.showSuccess('Registrasi berhasil! Silakan login.');
      setTimeout(() => {
        this._view.redirectToLogin();
      }, 2000);
    } catch (error) {
      console.error('Registrasi gagal:', error);
      this._view.showError(error.message || 'Registrasi gagal. Silakan coba lagi.');
    }
  }
}