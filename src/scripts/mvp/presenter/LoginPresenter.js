// src/scripts/mvp/presenter/LoginPresenter.js

export default class LoginPresenter {
  constructor({ view, authModel }) {
    this._view = view;
    this._authModel = authModel;
    
    this.init();
  }

  init() {
    // Inisialisasi view dan berikan referensi presenter
    this._view.initView(this);
  }

  async login(email, password) {
    try {
      // Panggil API login via model
      const response = await this._authModel.login(email, password);
      console.log('Login berhasil:', response);
      
      // Redirect ke halaman utama setelah login berhasil
      this._view.redirectToHome();
    } catch (error) {
      console.error('Login gagal:', error);
      this._view.showError(error.message || 'Login gagal. Silakan coba lagi.');
    }
  }
}