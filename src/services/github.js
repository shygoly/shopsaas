import axios from 'axios';

class GitHubAPIClient {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.baseURL = 'https://api.github.com';
    
    if (!this.token) {
      console.warn('GITHUB_TOKEN not set - GitHub API operations will fail');
    }
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      timeout: 30000,
    });
  }

  /**
   * Trigger a workflow dispatch
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} workflowId - Workflow ID or filename
   * @param {string} ref - Git ref (branch/tag)
   * @param {Object} inputs - Workflow inputs
   * @returns {Promise<Object>} Dispatch response
   */
  async triggerWorkflow(owner, repo, workflowId, ref = 'main', inputs = {}) {
    try {
      const response = await this.client.post(
        `/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
        {
          ref,
          inputs,
        }
      );
      
      return { success: true, status: response.status };
    } catch (error) {
      console.error(`Failed to trigger workflow ${workflowId}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      };
    }
  }

  /**
   * Get workflow runs for a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} options - Query options (per_page, status, etc.)
   * @returns {Promise<Object>} Workflow runs response
   */
  async getWorkflowRuns(owner, repo, options = {}) {
    try {
      const params = new URLSearchParams({
        per_page: options.per_page || '10',
        ...(options.status && { status: options.status }),
        ...(options.branch && { branch: options.branch }),
        ...(options.event && { event: options.event }),
      });

      const response = await this.client.get(`/repos/${owner}/${repo}/actions/runs?${params}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to get workflow runs:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      };
    }
  }

  /**
   * Get a specific workflow run
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string|number} runId - Run ID
   * @returns {Promise<Object>} Workflow run response
   */
  async getWorkflowRun(owner, repo, runId) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/actions/runs/${runId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to get workflow run ${runId}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      };
    }
  }

  /**
   * Get jobs for a workflow run
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string|number} runId - Run ID
   * @returns {Promise<Object>} Jobs response
   */
  async getWorkflowRunJobs(owner, repo, runId) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to get jobs for run ${runId}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      };
    }
  }

  /**
   * Find the most recent workflow run for specific inputs
   * This is useful to find the run that was just triggered
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} searchCriteria - Search criteria
   * @returns {Promise<Object>} Found run or null
   */
  async findRecentWorkflowRun(owner, repo, searchCriteria = {}) {
    try {
      // Get recent runs
      const runsResponse = await this.getWorkflowRuns(owner, repo, {
        per_page: '20',
        status: 'in_progress,queued,completed',
        event: 'workflow_dispatch',
      });

      if (!runsResponse.success) {
        return runsResponse;
      }

      const runs = runsResponse.data.workflow_runs;
      
      // If we have search criteria, try to match against them
      if (searchCriteria.app_name || searchCriteria.shop_name) {
        // Note: GitHub API doesn't expose workflow inputs in the runs list
        // We might need to check each run's jobs or use run logs
        // For now, we'll return the most recent run
        const recentRun = runs.find(run => 
          run.event === 'workflow_dispatch' && 
          new Date(run.created_at) > new Date(Date.now() - 10 * 60 * 1000) // within last 10 minutes
        );
        
        if (recentRun) {
          return { success: true, data: recentRun };
        }
      }

      return { success: true, data: null };
    } catch (error) {
      console.error('Failed to find recent workflow run:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Parse GitHub workflow status to our internal status
   * @param {string} githubStatus - GitHub workflow status
   * @param {string} githubConclusion - GitHub workflow conclusion
   * @returns {string} Internal status
   */
  parseWorkflowStatus(githubStatus, githubConclusion) {
    if (githubStatus === 'in_progress' || githubStatus === 'queued') {
      return 'running';
    }
    
    if (githubStatus === 'completed') {
      switch (githubConclusion) {
        case 'success':
          return 'success';
        case 'failure':
        case 'cancelled':
        case 'timed_out':
          return 'failed';
        default:
          return 'failed';
      }
    }
    
    return 'queued';
  }

  /**
   * Monitor a workflow run until completion
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string|number} runId - Run ID
   * @param {Function} onUpdate - Callback for status updates
   * @param {Object} options - Monitoring options
   * @returns {Promise<Object>} Final run status
   */
  async monitorWorkflowRun(owner, repo, runId, onUpdate = () => {}, options = {}) {
    const {
      maxPollingTime = 30 * 60 * 1000, // 30 minutes
      pollingInterval = 30 * 1000,     // 30 seconds
    } = options;

    const startTime = Date.now();
    
    console.log(`🔍 Starting to monitor workflow run ${runId}`);

    while (Date.now() - startTime < maxPollingTime) {
      try {
        const runResponse = await this.getWorkflowRun(owner, repo, runId);
        
        if (!runResponse.success) {
          console.error(`Failed to get run status: ${runResponse.error}`);
          await this.sleep(pollingInterval);
          continue;
        }

        const run = runResponse.data;
        const status = this.parseWorkflowStatus(run.status, run.conclusion);
        
        // Call update callback
        await onUpdate({
          github_run_id: runId,
          status,
          github_status: run.status,
          github_conclusion: run.conclusion,
          html_url: run.html_url,
          started_at: run.run_started_at,
          updated_at: run.updated_at,
        });

        // Check if run is complete
        if (run.status === 'completed') {
          console.log(`✅ Workflow run ${runId} completed with conclusion: ${run.conclusion}`);
          return {
            success: true,
            data: run,
            status,
            final: true,
          };
        }

        console.log(`⏳ Workflow run ${runId} status: ${run.status}`);
        await this.sleep(pollingInterval);
        
      } catch (error) {
        console.error(`Error monitoring run ${runId}:`, error);
        await this.sleep(pollingInterval);
      }
    }

    console.warn(`⏰ Monitoring timeout for workflow run ${runId}`);
    return {
      success: false,
      error: 'Monitoring timeout',
      timeout: true,
    };
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Trigger shop deployment via repository_dispatch
   * @param {Object} payload - Shop deployment payload
   * @returns {Promise<Object>} Dispatch response
   */
  async triggerDeploy(payload) {
    try {
      const owner = process.env.GH_REPO?.split('/')[0] || 'sgl1226';
      const repo = process.env.GH_REPO?.split('/')[1] || 'shopsaas';
      
      console.log(`Dispatching deploy-shop event to ${owner}/${repo}`);
      
      const response = await this.client.post(
        `/repos/${owner}/${repo}/dispatches`,
        {
          event_type: 'deploy-shop',
          client_payload: payload,
        }
      );
      
      console.log(`✅ Repository dispatch sent: ${response.status}`);
      
      // repository_dispatch returns 204 on success, no run_id immediately available
      // We need to poll for the run that just started
      await this.sleep(3000); // Wait 3s for workflow to start
      
      const recentRun = await this.findRecentWorkflowRun(owner, repo, {
        app_name: payload.app_name,
        shop_name: payload.shop_name,
      });
      
      return { 
        success: true, 
        run_id: recentRun.data?.id,
        status: response.status 
      };
    } catch (error) {
      console.error(`Failed to trigger deploy:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      };
    }
  }
}

// Export singleton instance
export const githubClient = new GitHubAPIClient();
export default githubClient;