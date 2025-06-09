import axios from "axios";

// API base URL - can be configured from environment variables
const API_BASE_URL = "http://localhost:8080";

// Settings service for handling all settings-related API calls
class SettingsService {
  // Get all settings
  async getSettings() {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings`);
      return response.data;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  }

  // Update settings
  async updateSettings(settings) {
    try {
      const response = await axios.put(`${API_BASE_URL}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  // Get specific setting by key
  async getSetting(key) {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      throw error;
    }
  }

  // Update specific setting
  async updateSetting(key, value) {
    try {
      const response = await axios.put(`${API_BASE_URL}/settings/${key}`, {
        value,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      throw error;
    }
  }

  // Reset settings to default
  async resetSettings() {
    try {
      const response = await axios.post(`${API_BASE_URL}/settings/reset`);
      return response.data;
    } catch (error) {
      console.error("Error resetting settings:", error);
      throw error;
    }
  }
}

export default new SettingsService();
