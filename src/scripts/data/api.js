import CONFIG from '../config';

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
};

// Get all stories
export async function getStories() {
  try {
    const response = await fetch(ENDPOINTS.STORIES);
    const responseJson = await response.json();
    return responseJson.listStory;
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw new Error('Failed to fetch stories');
  }
}

// Get story detail
export async function getStoryDetail(id) {
  try {
    const response = await fetch(ENDPOINTS.DETAIL_STORY(id));
    const responseJson = await response.json();
    return responseJson.story;
  } catch (error) {
    console.error('Error fetching story detail:', error);
    throw new Error('Failed to fetch story detail');
  }
}

// Add new story
export async function addStory(storyData) {
  try {
    const formData = new FormData();
    formData.append('description', storyData.description);
    formData.append('photo', storyData.photo);
    
    // Append location data if available
    if (storyData.lat && storyData.lon) {
      formData.append('lat', storyData.lat);
      formData.append('lon', storyData.lon);
    }
    
    const response = await fetch(ENDPOINTS.ADD_STORY, {
      method: 'POST',
      body: formData,
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error adding story:', error);
    throw new Error('Failed to add story');
  }
}