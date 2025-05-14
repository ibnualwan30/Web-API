// src/scripts/mvp/model/StoryModel.js

export default class StoryModel {
    constructor(storyApi) {
      this._storyApi = storyApi;
    }
  
    async getAllStories() {
      return await this._storyApi.getAllStories();
    }
  
    async getStoryDetail(id) {
      return await this._storyApi.getStoryDetail(id);
    }
  
    async addNewStory(formData) {
      return await this._storyApi.addNewStory(formData);
    }
  }