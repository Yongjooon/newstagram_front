import api from "./index";

const BASE_URL = "/api";

export default {
  // 설문조사 카테고리 목록 조회
  async getCategories() {
    const { data } = await api.get(`${BASE_URL}/survey/categories`);
    return data;
  },

  // 설문조사 결과 제출
  async submitCategories(categoryIds) {
    const { data } = await api.post(
      `${BASE_URL}/survey/submit`,
      { categoryIds },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return data;
  },

  // 유저 임베딩 데이터 조회
  async getUserEmbedding() {
    const { data } = await api.get(`${BASE_URL}/survey/users/embedding`);
    return data;
  },
};
