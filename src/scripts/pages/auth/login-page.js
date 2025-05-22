// src/scripts/pages/auth/login-page.js

import LoginView from '../../mvp/view/login-view';
import LoginPresenter from '../../mvp/presenter/LoginPresenter';
import StoryAPI from '../../data/story-api';
import AuthRepository from '../../data/auth-repository';
import AuthModel from '../../mvp/model/AuthModel';

export default class LoginPage {
  async render() {
    return `
      <div class="auth-container container">
        <a href="#loginForm" class="skip-link">Skip to content</a>
        
        <h1 tabindex="0">Login</h1>
        
        <form id="loginForm" class="auth-form" tabindex="-1">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <button type="submit" id="login-button">Login</button>
          
          <p>Belum punya akun? <a href="#/register">Daftar disini</a></p>
        </form>
        
        <div id="error-container" class="error-container"></div>
      </div>
    `;
  }

  async afterRender() {
    // Implementasi skip-link dengan perbaikan
    const skipLink = document.querySelector('.skip-link');
    const loginForm = document.getElementById('loginForm');
    
    if (skipLink && loginForm) {
      skipLink.addEventListener('click', (event) => {
        event.preventDefault();
        // Pastikan element ada sebelum memanggil focus()
        if (loginForm) {
          loginForm.focus();
        }
      });
    }
    
    // Inisialisasi View
    const view = new LoginView();
    
    // Inisialisasi Model
    const authModel = new AuthModel(StoryAPI, AuthRepository);
    
    // Inisialisasi Presenter
    new LoginPresenter({
      view,
      authModel
    });
  }
}