import StoryAPI from '../../data/story-api';
import ViewTransition from '../../utils/view-transition';

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
    const registerForm = document.getElementById('register-form');
    const errorContainer = document.getElementById('error-container');
    
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        await StoryAPI.register(name, email, password);
        
        errorContainer.className = 'success-container';
        errorContainer.textContent = 'Registrasi berhasil! Silakan login.';
        
        setTimeout(() => {
          ViewTransition.transit(() => {
            window.location.hash = '#/login';
          });
        }, 2000);
      } catch (error) {
        errorContainer.className = 'error-container';
        errorContainer.textContent = error.message || 'Registrasi gagal. Silakan coba lagi.';
      }
    });
    
    const skipLink = document.querySelector('.skip-link');
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('register-form').focus();
    });
  }
}