// src/scripts/mvp/presenter/RegisterPresenter.js

export default class RegisterPresenter {
    constructor({ view, authModel }) {
      this._view = view;
      this._authModel = authModel;
      
      this.init();
    }
  
    init() {
      this._view.setRegisterHandler(this.register.bind(this));
    }
  
    async register(name, email, password) {
      try {
        await this._authModel.register(name, email, password);
        this._view.showSuccess('Registrasi berhasil! Silakan login.');
        setTimeout(() => {
          this._view.redirectToLogin();
        }, 2000);
      } catch (error) {
        this._view.showError(error.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    }
  }