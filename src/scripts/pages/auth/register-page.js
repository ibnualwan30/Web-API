// src/scripts/pages/auth/register-page.js

import RegisterView from '../../mvp/view/register-view';
import RegisterPresenter from '../../mvp/presenter/RegisterPresenter';
import StoryAPI from '../../data/story-api';
import AuthRepository from '../../data/auth-repository';
import AuthModel from '../../mvp/model/AuthModel';

export default class RegisterPage {
  async render() {
    return `
      <div class="auth-container container">
        <a href="#register-form" class="skip-link">Skip to content</a>
        
        <h1 tabindex="0">Register</h1>
        
        <form id="register-form" class="auth-form" tabindex="-1">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required minlength="6">
            <small>Password minimal 6 karakter</small>
          </div>
          
          <button type="submit" id="register-button">Register</button>
          
          <p>Sudah punya akun? <a href="#/login">Login disini</a></p>
        </form>
        
        <div id="error-container" class="error-container"></div>
      </div>
    `;
  }

  async afterRender() {
    // Implementasi skip-link dengan perbaikan
    const skipLink = document.querySelector('.skip-link');
    const registerForm = document.getElementById('register-form');
    
    if (skipLink && registerForm) {
      skipLink.addEventListener('click', (event) => {
        event.preventDefault();
        // Pastikan element ada sebelum memanggil focus()
        if (registerForm) {
          registerForm.focus();
        }
      });
    }
    
    // Inisialisasi View
    const view = new RegisterView();
    
    // Inisialisasi Model
    const authModel = new AuthModel(StoryAPI, AuthRepository);
    
    // Inisialisasi Presenter
    new RegisterPresenter({
      view,
      authModel
    });
  }
}