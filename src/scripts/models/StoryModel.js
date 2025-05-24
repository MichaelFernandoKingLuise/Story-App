import CONFIG from "../config.js";

class StoryModel {
  constructor() {
    this.stories = [];
  }

  async getAllStories(token, location = 0, page = 1, size = 10) {
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/stories?location=${location}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (!data.error) {
        this.stories = data.listStory || [];
      }

      return data;
    } catch (error) {
      console.error("Error fetching stories:", error);
      return { error: true, message: "Failed to fetch stories" };
    }
  }

  async addNewStory(description, photo, lat, lon, token) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);

    if (lat && lon) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    } catch (error) {
      console.error("Error adding story:", error);
      return { error: true, message: "Failed to add story" };
    }
  }

  async addNewStoryGuest(description, photo, lat, lon) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);

    if (lat && lon) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/guest`, {
        method: "POST",
        body: formData,
      });
      return response.json();
    } catch (error) {
      console.error("Error adding story:", error);
      return { error: true, message: "Failed to add story" };
    }
  }

  async getStoryById(id, token) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching story:", error);
      return { error: true, message: "Failed to fetch story" };
    }
  }

  async saveBookmark(storyId, token) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/${storyId}/bookmark`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving bookmark:", error);
      return { error: true, message: "Failed to save bookmark" };
    }
  }

  getStories() {
    return this.stories;
  }
}

export default StoryModel;
