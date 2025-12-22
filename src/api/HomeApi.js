import api from './index';
import refreshToken from './refreshToken';

const BASE_URL = '/api';
const headers = {
    'Content-Type': 'multipart/form-data',
};

export default {
    async getArticles(periodType, cursor) {
        const response = await refreshToken.checkToken();
        const { data } = await api.get(`${BASE_URL}/article/hot-issues/${periodType}/${cursor}`);
        return data;
    },

}