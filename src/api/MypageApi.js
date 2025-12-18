import api from './index';
import refreshToken from './refreshToken';

const BASE_URL = '/api';
const headers = {
    'Content-Type': 'multipart/form-data',
};

export default {
    async getMyInfo() {
       // const response = await refreshToken.checkToken();
        const { data } = await api.get(`${BASE_URL}/users/me`);
        return data;
    },

    async changePW(currentPassword, newPassword) {
        const payload = { currentPassword, newPassword };
       // const response = await refreshToken.checkToken();
        const { data } = await api.patch(`${BASE_URL}/users/me/password`,
            payload
        );
        return data;
    },

    async changeNickName(newNickname) {
        const payload = { newNickname };
       // const response = await refreshToken.checkToken();
        const { data } = await api.patch(`${BASE_URL}/users/me/nickname`,
            payload
        );
        return data;
    },

}