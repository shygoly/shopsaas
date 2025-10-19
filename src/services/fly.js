import axios from 'axios';

class FlyAPIClient {
  constructor() {
    this.apiToken = process.env.FLY_API_TOKEN;
    this.baseURL = 'https://api.fly.io/v1';
    
    if (!this.apiToken) {
      console.warn('FLY_API_TOKEN not set - Fly API operations will fail');
    }
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Create a new Fly app
   * @param {string} appName - Name of the app
   * @param {string} orgSlug - Organization slug (default: personal)
   * @returns {Promise<Object>} App creation response
   */
  async createApp(appName, orgSlug = 'personal') {
    try {
      const response = await this.client.post('/apps', {
        app_name: appName,
        org_slug: orgSlug,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to create app ${appName}:`, error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        status: error.response?.status 
      };
    }
  }

  /**
   * Check if an app exists
   * @param {string} appName - Name of the app
   * @returns {Promise<boolean>} Whether the app exists
   */
  async appExists(appName) {
    try {
      const response = await this.client.get(`/apps/${appName}`);
      return response.status === 200;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      console.error(`Error checking app existence for ${appName}:`, error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Set secrets for an app
   * @param {string} appName - Name of the app
   * @param {Object} secrets - Key-value pairs of secrets
   * @returns {Promise<Object>} Success/failure response
   */
  async setSecrets(appName, secrets) {
    try {
      // Fly API expects secrets in a specific format
      const secretsArray = Object.entries(secrets).map(([key, value]) => ({
        key,
        value: String(value), // Ensure value is a string
      }));

      const response = await this.client.post(`/apps/${appName}/secrets`, {
        secrets: secretsArray,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to set secrets for app ${appName}:`, error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        status: error.response?.status 
      };
    }
  }

  /**
   * Get app status
   * @param {string} appName - Name of the app
   * @returns {Promise<Object>} App status response
   */
  async getAppStatus(appName) {
    try {
      const response = await this.client.get(`/apps/${appName}/status`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to get status for app ${appName}:`, error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        status: error.response?.status 
      };
    }
  }

  /**
   * Get app machines/instances
   * @param {string} appName - Name of the app
   * @returns {Promise<Object>} App machines response
   */
  async getAppMachines(appName) {
    try {
      const response = await this.client.get(`/apps/${appName}/machines`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to get machines for app ${appName}:`, error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        status: error.response?.status 
      };
    }
  }

  /**
   * Check if app is healthy by making HTTP request
   * @param {string} appName - Name of the app
   * @param {string} path - Path to check (default: /)
   * @returns {Promise<Object>} Health check response
   */
  async healthCheck(appName, path = '/') {
    try {
      const appUrl = `https://${appName}.fly.dev${path}`;
      const response = await axios.get(appUrl, {
        timeout: 15000,
        validateStatus: (status) => status < 500, // Accept any status < 500
      });
      
      return { 
        success: true, 
        healthy: response.status < 400,
        status: response.status,
        url: appUrl 
      };
    } catch (error) {
      console.error(`Health check failed for app ${appName}:`, error.message);
      return { 
        success: false, 
        healthy: false,
        error: error.message,
        url: `https://${appName}.fly.dev${path}`
      };
    }
  }

  /**
   * Delete/destroy an app
   * @param {string} appName - Name of the app
   * @returns {Promise<Object>} Deletion response
   */
  async destroyApp(appName) {
    try {
      const response = await this.client.delete(`/apps/${appName}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to destroy app ${appName}:`, error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        status: error.response?.status 
      };
    }
  }

  /**
   * Convenience method to securely provision a new shop
   * @param {string} appName - Fly app name
   * @param {string} shopName - Human readable shop name
   * @param {string} adminEmail - Admin email
   * @param {string} adminPassword - Admin password
   * @returns {Promise<Object>} Provisioning response
   */
  async provisionShop(appName, shopName, adminEmail, adminPassword) {
    try {
      // Check if app already exists
      const exists = await this.appExists(appName);
      
      if (!exists) {
        // Create the app
        const createResult = await this.createApp(appName);
        if (!createResult.success) {
          return createResult;
        }
        console.log(`✅ Created Fly app: ${appName}`);
      } else {
        console.log(`ℹ️ Fly app already exists: ${appName}`);
      }

      // Set secrets for the app
      const secretsResult = await this.setSecrets(appName, {
        ADMIN_EMAIL: adminEmail,
        ADMIN_PASSWORD: adminPassword,
        SHOP_NAME: shopName,
      });

      if (!secretsResult.success) {
        return secretsResult;
      }
      
      console.log(`✅ Set secrets for app: ${appName}`);

      return { 
        success: true, 
        appName,
        message: 'Shop provisioned successfully, ready for deployment' 
      };
    } catch (error) {
      console.error('Shop provisioning failed:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

// Export singleton instance
export const flyClient = new FlyAPIClient();
export default flyClient;