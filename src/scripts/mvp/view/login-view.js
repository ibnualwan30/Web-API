// src/scripts/mvp/view/login-view.js

export default class LoginView {
    constructor() {
      this._form = document.getElementById('login-form');
      this._errorContainer = document.getElementById('error-container');
    }
  
    setLoginHandler(handler) {
      this._form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        handler(email, password);
      });
    }
  
    showError(message) {
      this._errorContainer.textContent = message;
      this._errorContainer.className = 'error-container';
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