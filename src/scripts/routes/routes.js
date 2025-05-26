import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import StoryDetailPage from '../pages/story/story-detail-page';
import AddStoryPage from '../pages/story/add-story-page';
import FavoritesPage from '../pages/favorites/favorites-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/detail/:id': new StoryDetailPage(),
  '/add-story': new AddStoryPage(),
  '/favorites': new FavoritesPage(),
};

export default routes;