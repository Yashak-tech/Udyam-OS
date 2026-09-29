const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || API_BASE_URL.replace(/^http/, 'ws');

class ApiClient {
  async _request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      // Handle raw content (like raw HTML)
      if (options.raw) {
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        return await response.text();
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.detail || data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to Udyam OS server. Please ensure backend is running.');
      }
      throw err;
    }
  }

  // Session endpoints
  async createSession(founderName = 'Founder', deviceId = 'iqoo_phone') {
    return this._request('/api/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ founder_name: founderName, device_id: deviceId }),
    });
  }

  async submitGoal(sessionId, rawIntent, modality = 'text') {
    return this._request(`/api/v1/sessions/${sessionId}/goals`, {
      method: 'POST',
      body: JSON.stringify({ raw_intent: rawIntent, modality }),
    });
  }

  async getSession(sessionId) {
    return this._request(`/api/v1/sessions/${sessionId}`);
  }

  async getContext(sessionId) {
    return this._request(`/api/v1/sessions/${sessionId}/context`);
  }

  // Artifact endpoints
  async getArtifacts(sessionId) {
    return this._request(`/api/v1/sessions/${sessionId}/artifacts`);
  }

  async getArtifact(sessionId, artifactId, raw = false) {
    return this._request(`/api/v1/sessions/${sessionId}/artifacts/${artifactId}${raw ? '?raw=true' : ''}`, {
      raw,
    });
  }

  // Approval & Governance
  async submitApproval(sessionId, decision = 'APPROVED', founderNotes = '') {
    return this._request(`/api/v1/sessions/${sessionId}/approval`, {
      method: 'POST',
      body: JSON.stringify({ decision, founder_notes: founderNotes }),
    });
  }

  async submitFeedback(sessionId, targetAgent, critiqueText, targetArtifactId = null) {
    return this._request(`/api/v1/sessions/${sessionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({
        target_agent: targetAgent,
        critique_text: critiqueText,
        target_artifact: targetArtifactId,
      }),
    });
  }

  // Office Kit
  async triggerOfficeKitSync(sessionId) {
    return this._request('/api/v1/office-kit/sync', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  // Health
  async checkHealth() {
    return this._request('/health');
  }
}

export const api = new ApiClient();
