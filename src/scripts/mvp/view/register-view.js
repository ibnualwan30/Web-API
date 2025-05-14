// src/scripts/mvp/view/register-view.js

export default class RegisterView {
    constructor() {
      this._form = document.getElementById('register-form');
      this._errorContainer = document.getElementById('error-container');
    }
  
    setRegisterHandler(handler) {
      this._form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        handler(name, email, password);
      });
    }
  
    showError(message) {
      this._errorContainer.className = 'error-container';
      this._errorContainer.textContent = message;
    }
  
    showSuccess(message) {
      this._errorContainer.className = 'success-container';
      this._errorContainer.textContent = message;
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