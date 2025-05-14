// src/scripts/mvp/model/AuthModel.js

export default class AuthModel {
    constructor(storyApi, authRepository) {
      this._storyApi = storyApi;
      this._authRepository = authRepository;
    }
  
    isAuthenticated() {
      return this._authRepository.isAuthenticated();
    }
  
    async login(email, password) {
      return await this._storyApi.login(email, password);
    }
  
    async register(name, email, password) {
      return await this._storyApi.register(name, email, password);
    }
  
    logout() {
      this._storyApi.logout();
    }
  
    getToken() {
      return this._authRepository.getToken();
    }
  }