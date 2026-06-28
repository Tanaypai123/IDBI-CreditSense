const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = {
  /**
   * Assesses risk metrics for a single business.
   */
  async predictSingle(payload) {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Single prediction error: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Evaluates a multi-row CSV business register.
   */
  async predictBatch(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/predict/batch`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Batch prediction error: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Loads global model metrics and correlations.
   */
  async getGlobalAnalytics() {
    const response = await fetch(`${API_BASE_URL}/api/analytics/global`);
    if (!response.ok) {
      throw new Error(`Global analytics retrieval error: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Downloads a generated assessment report PDF.
   */
  async downloadReportPdf(payload) {
    const response = await fetch(`${API_BASE_URL}/api/report/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Report PDF generation error: ${response.statusText}`);
    }
    return response.blob();
  },
};
