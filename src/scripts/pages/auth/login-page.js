import StoryAPI from '../../data/story-api';
import ViewTransition from '../../utils/view-transition';


export default class LoginPage {
  async render() {
    return `
      <div class="auth-container container">
        <h1 tabindex="0">Login</h1>
        
        <a href="#" class="skip-link">Skip to content</a>
        
        <form id="login-form" class="auth-form">
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
    const loginForm = document.getElementById('login-form');
    const errorContainer = document.getElementById('error-container');
    
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        await StoryAPI.login(email, password);
        
        
        ViewTransition.transit(() => {
          window.location.hash = '#/';
        });
      } catch (error) {
        errorContainer.textContent = error.message || 'Login gagal. Silakan coba lagi.';
      }
    });
    
    // Implementasi skip-link
    const skipLink = document.querySelector('.skip-link');
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('login-form').focus();
    });
  }
}