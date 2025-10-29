import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class FlyAPIClient {
  constructor() {
    this.apiToken = process.env.FLY_API_TOKEN;
    this.graphqlURL = 'https://api.fly.io/graphql';
    this.machinesURL = 'https://api.machines.dev/v1';
    
    if (!this.apiToken) {
      console.warn('FLY_API_TOKEN not set - Fly API operations will fail');
    }
    
    // GraphQL client for app management
    this.graphqlClient = axios.create({
      baseURL: this.graphqlURL,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    
    // Create Machines API client
    this.machinesClient = axios.create({
      baseURL: this.machinesURL,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // Longer timeout for machine operations
    });
  }

  /**
   * Create a new Fly app using Machines API
   * NOTE: This is now handled automatically by createMachine - first machine creation auto-creates the app
   * @param {string} appName - Name of the app
   * @param {string} orgSlug - Organization slug (default: chada)
   * @returns {Promise<Object>} App creation response
   */
  async createApp(appName, orgSlug = 'chada') {
    // With Machines API, we don't need to pre-create the app
    // The first machine creation will auto-create the app in the org
    console.log(`ℹ️ App ${appName} will be auto-created by Machines API on first machine creation`);
    return { 
      success: true, 
      data: { name: appName, org: orgSlug },
      message: 'App will be created automatically'
    };
  }

  /**
   * Check if an app exists using Machines API
   * @param {string} appName - Name of the app
   * @returns {Promise<boolean>} Whether the app exists
   */
  async appExists(appName) {
    try {
      const response = await this.machinesClient.get(`/apps/${appName}/machines`);
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
   * Set secrets for an app using flyctl CLI
   * @param {string} appName - Name of the app
   * @param {Object} secrets - Key-value pairs of secrets
   * @returns {Promise<Object>} Success/failure response
   */
  async setSecrets(appName, secrets) {
    try {
      // Build secrets arguments for flyctl
      const secretArgs = Object.entries(secrets)
        .map(([key, value]) => `${key}="${String(value).replace(/"/g, '\\"')}"`)
        .join(' ');
      
      const cmd = `flyctl secrets set ${secretArgs} -a ${appName}`;
      console.log(`Setting secrets for ${appName} (${Object.keys(secrets).length} secrets)`);
      
      const { stdout, stderr } = await execAsync(cmd, {
        env: { ...process.env, FLY_API_TOKEN: this.apiToken },
        timeout: 60000
      });
      
      if (stderr && stderr.includes('error')) {
        console.error(`flyctl secrets stderr for ${appName}:`, stderr);
        return { success: false, error: stderr };
      }
      
      console.log(`✅ Secrets set for ${appName}`);
      return { success: true, data: { stdout, stderr } };
    } catch (error) {
      console.error(`Failed to set secrets for app ${appName}:`, error.message);
      return { 
        success: false, 
        error: error.message,
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
   * Creates app via flyctl CLI, then sets secrets
   * @param {string} appName - Fly app name
   * @param {string} shopName - Human readable shop name
   * @param {string} adminEmail - Admin email
   * @param {string} adminPassword - Admin password
   * @returns {Promise<Object>} Provisioning response
   */
  async provisionShop(appName, shopName, adminEmail, adminPassword, extra = {}) {
    try {
      // Check if app already exists
      const exists = await this.appExists(appName);
      
      if (!exists) {
        // Create the app via CLI
        const createResult = await this.createApp(appName, 'chada');
        if (!createResult.success) {
          return createResult;
        }
        console.log(`✅ Created Fly app: ${appName}`);
      } else {
        console.log(`ℹ️ Fly app already exists: ${appName}`);
      }

      // Prepare secrets payload
      const secretsPayload = {
        ADMIN_EMAIL: adminEmail,
        ADMIN_PASSWORD: adminPassword,
        SHOP_NAME: shopName,
      };
      
      // attach plan/limits/expiry for child app enforcement (optional)
      if (extra?.plan) secretsPayload.SHOP_PLAN = String(extra.plan);
      if (extra?.limits) secretsPayload.SHOP_LIMITS_JSON = JSON.stringify(extra.limits);
      if (extra?.expires_at) secretsPayload.SHOP_EXPIRES_AT = String(extra.expires_at);
      
      // Set secrets via CLI
      const secretsResult = await this.setSecrets(appName, secretsPayload);
      if (!secretsResult.success) {
        return secretsResult;
      }

      return { 
        success: true, 
        appName,
        secrets: secretsPayload,
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

  /**
   * Create a new machine using Fly Machines API
   * @param {string} appName - Name of the app
   * @param {Object} machineConfig - Machine configuration
   * @returns {Promise<Object>} Machine creation response
   */
  async createMachine(appName, machineConfig) {
    try {
      const response = await this.machinesClient.post(`/apps/${appName}/machines`, machineConfig);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to create machine for app ${appName}:`, error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        status: error.response?.status 
      };
    }
  }

  /**
   * Get machine details
   * @param {string} appName - Name of the app
   * @param {string} machineId - Machine ID
   * @returns {Promise<Object>} Machine details
   */
  async getMachine(appName, machineId) {
    try {
      const response = await this.machinesClient.get(`/apps/${appName}/machines/${machineId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to get machine ${machineId}:`, error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        status: error.response?.status 
      };
    }
  }

  /**
   * Wait for machine to start
   * @param {string} appName - Name of the app
   * @param {string} machineId - Machine ID
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Final state
   */
  async waitForMachineStart(appName, machineId, timeout = 300000) {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds
    
    console.log(`Waiting for machine ${machineId} to start...`);
    
    while (Date.now() - startTime < timeout) {
      const result = await this.getMachine(appName, machineId);
      
      if (result.success) {
        const machine = result.data;
        
        // Check if machine is in a started state
        if (machine.state === 'started') {
          console.log(`✅ Machine ${machineId} is started`);
          return { success: true, state: 'started', machine };
        }
        
        // Check if machine failed to start
        if (machine.state === 'stopped' || machine.state === 'error') {
          console.error(`❌ Machine ${machineId} failed to start, state: ${machine.state}`);
          return { success: false, state: machine.state, error: 'Machine failed to start' };
        }
        
        console.log(`⏳ Machine ${machineId} state: ${machine.state}, waiting...`);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    console.error(`⏰ Timeout waiting for machine ${machineId} to start`);
    return { success: false, error: 'Timeout waiting for machine to start' };
  }

  /**
   * Get machine metrics
   * @param {string} appName - Name of the app
   * @param {string} machineId - Machine ID
   * @returns {Promise<Object>} Machine metrics
   */
  async getMachineMetrics(appName, machineId) {
    try {
      const response = await this.machinesClient.get(`/apps/${appName}/machines/${machineId}/metrics`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to get metrics for machine ${machineId}:`, error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        status: error.response?.status 
      };
    }
  }
}

// Export singleton instance
export const flyClient = new FlyAPIClient();
export default flyClient;