import api from "./index";
import refreshToken from "./refreshToken";

const BASE_URL = "/api";
const headers = {
  "Content-Type": "multipart/form-data",
};

export default {
  async getPromptList() {
    const response = await refreshToken.checkToken();
    const { data } = await api.get(`${BASE_URL}/v1/search/history`);
    return data;
  },

  async getPrompt(payload) {
    const response = await refreshToken.checkToken();
    const { data } = await api.post(`${BASE_URL}/v1/search`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  },

  async deletePrompt(historyId) {
    await refreshToken.checkToken();
    const { data } = await api.delete(`${BASE_URL}/v1/search/history`, {
      params: { historyId },
    });
    return data;
  },
};
