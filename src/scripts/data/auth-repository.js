import CONFIG from '../config';

const AuthRepository = {
  isAuthenticated() {
    return Boolean(this.getToken());
  },

  getToken() {
    return localStorage.getItem(CONFIG.AUTH_KEY);
  },

  setToken(token) {
    localStorage.setItem(CONFIG.AUTH_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(CONFIG.AUTH_KEY);
  }
};

export default AuthRepository;