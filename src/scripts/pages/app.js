// src/scripts/pages/app.js - Fixed Content Rendering

import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import ViewTransition from '../utils/view-transition';
import AuthRepository from '../data/auth-repository';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) {
      console.warn('Drawer elements not found');
      return;
    }

    this.#drawerButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.#navigationDrawer.classList.toggle('open');
      console.log('Drawer toggled:', this.#navigationDrawer.classList.contains('open'));
    });

    // Close drawer when clicking outside
    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }
    });

    // Close drawer when clicking on navigation links
    this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        this.#navigationDrawer.classList.remove('open');
      });
    });

    // Close drawer on escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.#navigationDrawer.classList.contains('open')) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.focus();
      }
    });
  }

  async renderPage() {
    console.log('App.renderPage called');
    
    const url = getActiveRoute();
    console.log('Current route:', url);
    
    let page = routes[url];
    
    // Periksa apakah URL memiliki parameter ID
    if (!page && url.includes(':id')) {
      const pathSegments = window.location.hash.substring(1).split('/');
      if (pathSegments.length >= 2) {
        const dynamicRoute = `/${pathSegments[1]}/:id`;
        page = routes[dynamicRoute];
        console.log('Using dynamic route:', dynamicRoute);
      }
    }
    
    // Jika page tidak ditemukan, gunakan halaman utama
    if (!page) {
      console.log('Page not found, using home page');
      page = routes['/'];
    }
    
    // Redirect ke halaman login jika belum terautentikasi dan bukan halaman auth
    const isLoginPage = url === '/login';
    const isRegisterPage = url === '/register';
    const isAboutPage = url === '/about'; // Halaman About bisa diakses tanpa login
    const isAuthPage = isLoginPage || isRegisterPage || isAboutPage;
    
    if (!AuthRepository.isAuthenticated() && !isAuthPage) {
      console.log('Not authenticated, redirecting to login');
      page = routes['/login'];
      window.location.hash = '#/login';
    }
    
    // Debug: Check content element
    console.log('Content element:', this.#content);
    
    if (!this.#content) {
      console.error('Content element not found!');
      return;
    }
    
    try {
      // Gunakan View Transition API jika tersedia
      if (document.startViewTransition) {
        document.startViewTransition(async () => {
          const htmlContent = await page.render();
          console.log('Rendered HTML length:', htmlContent.length);
          this.#content.innerHTML = htmlContent;
          await page.afterRender();
        });
      } else {
        const htmlContent = await page.render();
        console.log('Rendered HTML length:', htmlContent.length);
        this.#content.innerHTML = htmlContent;
        await page.afterRender();
      }
      
      console.log('Page rendered successfully');
    } catch (error) {
      console.error('Error rendering page:', error);
      this.#content.innerHTML = `
        <div class="error-container">
          <h1>Error Loading Page</h1>
          <p>Sorry, there was an error loading this page.</p>
          <p>Error: ${error.message}</p>
          <a href="#/" class="btn">Return to Home</a>
        </div>
      `;
    }
  }
}

export default App;