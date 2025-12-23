import api from "./index";
import refreshToken from "./refreshToken";

const BASE_URL = "/api";
const headers = {
  "Content-Type": "multipart/form-data",
};

export default {
  async getMyArticles(page = 0, limit = 15) {
    const response = await refreshToken.checkToken();
    const { data } = await api.get(`${BASE_URL}/article/home-issues`);
    return data;
  },
};
