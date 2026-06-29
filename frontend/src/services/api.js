const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://idbi-creditsense.onrender.com';

let activeUserRequests = 0;
const listeners = new Set();

export const activeRequestNotifier = {
  subscribe(callback) {
    listeners.add(callback);
    callback(activeUserRequests);
    return () => {
      listeners.delete(callback);
    };
  },
  startRequest() {
    activeUserRequests++;
    listeners.forEach(cb => cb(activeUserRequests));
  },
  endRequest() {
    activeUserRequests = Math.max(0, activeUserRequests - 1);
    listeners.forEach(cb => cb(activeUserRequests));
  }
};

export const api = {
  /**
   * Assesses risk metrics for a single business.
   */
  async predictSingle(payload) {
    activeRequestNotifier.startRequest();
    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Single prediction error: ${response.statusText}`);
      }
      return await response.json();
    } finally {
      activeRequestNotifier.endRequest();
    }
  },

  /**
   * Evaluates a multi-row CSV business register.
   */
  async predictBatch(file) {
    activeRequestNotifier.startRequest();
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/predict/batch`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Batch prediction error: ${response.statusText}`);
      }
      return await response.json();
    } finally {
      activeRequestNotifier.endRequest();
    }
  },

  /**
   * Loads global model metrics and correlations.
   */
  async getGlobalAnalytics() {
    activeRequestNotifier.startRequest();
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/global`);
      if (!response.ok) {
        throw new Error(`Global analytics retrieval error: ${response.statusText}`);
      }
      return await response.json();
    } finally {
      activeRequestNotifier.endRequest();
    }
  },

  /**
   * Downloads a generated assessment report PDF.
   */
  async downloadReportPdf(payload) {
    activeRequestNotifier.startRequest();
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Report PDF generation error: ${response.statusText}`);
      }
      return await response.blob();
    } finally {
      activeRequestNotifier.endRequest();
    }
  },

  /**
   * Silently warm up the backend server in the background.
   */
  async warmUp() {
    try {
      await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        mode: 'no-cors'
      });
    } catch (e) {
      // Silently ignore warmup errors
    }
  }
};

