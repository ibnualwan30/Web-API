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
        <h1 tabindex="0">Register</h1>
        
        <a href="#" class="skip-link">Skip to content</a>
        
        <form id="register-form" class="auth-form">
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
    // Implementasi skip-link
    const skipLink = document.querySelector('.skip-link');
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('register-form').focus();
    });
    
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