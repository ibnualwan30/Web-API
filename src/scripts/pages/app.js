import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import ViewTransition from '../utils/view-transition';

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
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    let page = routes[url];
    
    // Periksa apakah URL memiliki parameter ID
    if (url.includes(':id')) {
      const pathSegments = window.location.hash.substring(1).split('/');
      if (pathSegments.length >= 2) {
        const dynamicRoute = `/${pathSegments[1]}/:id`;
        page = routes[dynamicRoute];
      }
    }
    
    if (!page) {
      page = routes['/'];
    }
    
    // Gunakan View Transition API jika tersedia
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    }
  }
}

export default App;