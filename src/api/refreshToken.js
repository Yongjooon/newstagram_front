import api from '@/api/index';
import { useUserStore } from '@/stores/user';
import router from '@/router';


const BASE_URL = '/token';

export default {
  // token 유효성 검사
    async checkToken() {
        const { getToken, getRefreshToken, setToken} = useUserStore();
        const token = getToken();
        const refreshToken = getRefreshToken();

        try {
            const response = await api.get(BASE_URL, {
                headers: {
                'Authorization': token, // Access Token
                'refreshToken': refreshToken,       // Refresh Token
                'Content-Type': 'application/json'  // JSON 요청
                }
            });
            if(response.data.accessTokenOK){
                return response;
            }
            else if(response.data.accessToken){
                const newAccessToken = response.data.accessToken;
                setToken(newAccessToken);
            }
            } catch (error) {
            // 401 오류 외의 다른 오류 처리
                if (error.response && error.response.status === 401) {
                    await this.logouting(); // 로그아웃 처리
                    alert('로그인 후 이용해주세요.');
                    router.push('/user'); // 로그인 페이지로 리디렉션
                } else {
                    alert('로그인 후 이용해주세요.');
                    router.push('/user'); // 로그인 페이지로 리디렉션
                    throw error; // 그 외 오류는 예외로 처리
                }
            }
        },

        async logouting(){
            const {getToken, getRefreshToken, logout } = useUserStore();
            const refreshToken = getRefreshToken();
            const token = getToken();
            try{
                const response = await api.get('/user/logout', {
                    headers: {
                    'Authorization': token, // Access Token
                    'refreshToken': refreshToken,       // Refresh Token
                    'Content-Type': 'application/json'  // JSON 요청
                    }
                });
                logout();
            }catch(error){
                console.log(error);
            }
        }
};
