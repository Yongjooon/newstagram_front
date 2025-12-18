import api from './index';
import refreshToken from './refreshToken';

const BASE_URL = '/api';
const headers = {
    'Content-Type': 'multipart/form-data',
};

export default {
    async addLog(articleId) {
       // const response = await refreshToken.checkToken();
        if (articleId === undefined || articleId === null) {
            throw new Error('articleId is required');
        }
        const payload = { articleId };
        const { data } = await api.post(`${BASE_URL}/logging/click`, payload, {withCredentials: true,});
        console.log(data);
        return data;
    },


}