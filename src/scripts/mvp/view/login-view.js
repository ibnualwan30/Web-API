// src/scripts/mvp/view/login-view.js

export default class LoginView {
    constructor() {
      this._form = null;
      this._errorContainer = null;
    }
    
    // Inisialisasi view dan DOM elements setelah render
    initView(presenter) {
      this._presenter = presenter;
      
      // Menggunakan ID yang benar (loginForm, bukan login-form)
      this._form = document.getElementById('loginForm');
      this._errorContainer = document.getElementById('error-container');
      
      // Setup event handler untuk login
      this.setLoginHandler();
    }
  
    setLoginHandler() {
      if (!this._form) {
        console.error('Form login tidak ditemukan!');
        return;
      }
      
      this._form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (this._presenter) {
          this._presenter.login(email, password);
        }
      });
    }
  
    showError(message) {
      if (this._errorContainer) {
        this._errorContainer.textContent = message;
        this._errorContainer.className = 'error-container';
      }
    }
  
    redirectToHome() {
      // Gunakan View Transition API jika tersedia
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          window.location.hash = '#/';
        });
      } else {
        window.location.hash = '#/';
      }
    }
  
    redirectToLogin() {
      // Gunakan View Transition API jika tersedia
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          window.location.hash = '#/login';
        });
      } else {
        window.location.hash = '#/login';
      }
    }
  }