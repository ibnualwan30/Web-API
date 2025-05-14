// src/scripts/mvp/presenter/LoginPresenter.js

export default class LoginPresenter {
    constructor({ view, authModel }) {
      this._view = view;
      this._authModel = authModel;
      
      this.init();
    }
  
    init() {
      this._view.setLoginHandler(this.login.bind(this));
    }
  
    async login(email, password) {
      try {
        await this._authModel.login(email, password);
        this._view.redirectToHome();
      } catch (error) {
        this._view.showError(error.message || 'Login gagal. Silakan coba lagi.');
      }
    }
  }