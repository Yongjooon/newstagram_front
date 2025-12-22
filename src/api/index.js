//프로젝트의 공통 API 모듈

import axios from 'axios';
import { useUserStore } from '../stores/user';
import router from '../router';
import _env from "../lib/env";

const instance = axios.create({
  baseURL: _env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    const { getToken } = useUserStore();
    const token = getToken();
    // Authorization 헤더에 토큰 추가
    if (token) {
      config.headers['Authorization'] = `${token}`;
    }
    return config;
  },
  (error) => {
    // 요청 오류 처리
    return Promise.reject(error);
  }
);

// 응답 인터셉터
instance.interceptors.response.use(
  (response) => {
    // 성공적으로 응답을 받은 경우 처리
    if (response.status === 200) {
      return response;
    }
    if (response.status === 404) {
      return Promise.reject('404: 페이지를 찾을 수 없습니다. 요청: ' + response.request);
    }
    return response;
  },
  async (error) => {
    // 401 Unauthorized 처리
    if (error.response?.status === 401) {
      const { logout } = useUserStore();
      await logout();
      
      // 로그인 페이지로 리다이렉트
      router.push('/user');
      return Promise.reject({ error: '로그인이 필요한 서비스입니다.' });
    }

    // 기타 에러 처리
    return Promise.reject(error);
  }
);

export default instance;
