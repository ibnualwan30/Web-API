import CONFIG from '../config';
import AuthRepository from './auth-repository';

const StoryAPI = {
  async getAllStories() {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories?location=1`, {
        headers: {
          'Authorization': `Bearer ${AuthRepository.getToken()}`,
        },
      });
      
      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      
      return responseJson.listStory || [];
    } catch (error) {
      console.error('Error fetching stories:', error);
      return [];
    }
  },

  async getStoryDetail(id) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
        headers: {
          'Authorization': `Bearer ${AuthRepository.getToken()}`,
        },
      });
      
      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      
      return responseJson.story;
    } catch (error) {
      console.error(`Error fetching story with id ${id}:`, error);
      return null;
    }
  },

  async addNewStory(formData) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AuthRepository.getToken()}`,
        },
        body: formData,
      });
      
      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      
      return responseJson;
    } catch (error) {
      console.error('Error adding new story:', error);
      throw error;
    }
  },

  async register(name, email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      
      return responseJson;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      
      // Simpan token
      AuthRepository.setToken(responseJson.loginResult.token);
      
      return responseJson;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },
  
  logout() {
    AuthRepository.clearToken();
  }
};

export default StoryAPI;