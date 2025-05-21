// src/scripts/mvp/view/register-view.js

export default class RegisterView {
    constructor() {
      this._form = null;
      this._errorContainer = null;
      this._presenter = null;
    }
    
    // Inisialisasi view setelah render
    initView(presenter) {
      this._presenter = presenter;
      
      // Inisialisasi DOM elements
      this._form = document.getElementById('register-form');
      this._errorContainer = document.getElementById('error-container');
      
      this.setRegisterHandler();
    }
  
    setRegisterHandler() {
      if (!this._form) {
        console.error('Form register tidak ditemukan!');
        return;
      }
      
      this._form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (this._presenter) {
          this._presenter.register(name, email, password);
        }
      });
    }
  
    showError(message) {
      if (this._errorContainer) {
        this._errorContainer.className = 'error-container';
        this._errorContainer.textContent = message;
      }
    }
  
    showSuccess(message) {
      if (this._errorContainer) {
        this._errorContainer.className = 'success-container';
        this._errorContainer.textContent = message;
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