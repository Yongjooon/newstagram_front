// src/stores/user.js
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import UserApi from "../api/UserApi";

const initState = {
  token: '',
  refreshToken: '',
  initialized: null,
  user: {
    userId: ''
  }
};

export const useUserStore = defineStore('user', () => {
  const state = ref({ ...initState });

  const isLogin = computed(() => {
    return !!(state.value.token && state.value.user.userId);
  });

  const id = computed(() => state.value.user.userId);

  const login = async (loginUser) => {
    try {
      const res = await UserApi.login(loginUser);

      // 토큰이 없거나 형식이 이상하면 실패로 처리
      if (
        typeof res?.data?.accessToken !== 'string' ||
        !res.data.accessToken.startsWith('Bearer')
      ) {
        throw new Error('아이디 혹은 비밀번호가 다릅니다.');
      }

      state.value.token = res.data.accessToken;
      state.value.refreshToken = res.data.refreshToken;
      state.value.initialized = res.data.initialized;
      state.value.user.userId = loginUser.email;

      localStorage.setItem('user', JSON.stringify(state.value));
      return res;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        error?.error ||
        "";

      const status = error?.response?.status;

      // 401 또는 유사 메시지면 로그인 실패 문구로 통일
      if (
        status === 401 ||
        msg.includes("로그인이 필요한") ||
        msg.includes("Unauthorized")
      ) {
        throw new Error("아이디 혹은 비밀번호가 다릅니다.");
      }

      throw error;
    }
  };

  // 소셜 로그인(토큰/아이디 저장)
  const socialLogin = async (user) => {
    try {
      state.value.token = user.token;
      state.value.refreshToken = user.refreshToken;
      state.value.initialized = user.initialized;
      state.value.user.userId = "tmp"; 

      localStorage.setItem('user', JSON.stringify(state.value));

      return true;
    } catch (error) {
      throw error;
    }
  };

  //로그아웃: user 키만 제거 (localStorage.clear()는 다른 값까지 지움)
  const logout = () => {
    localStorage.removeItem('user');
    state.value = { ...initState };
  };

  const getToken = () => state.value.token;
  const getRefreshToken = () => state.value.refreshToken;

  const setToken = (token) => {
    state.value.token = token;
    localStorage.setItem('user', JSON.stringify(state.value));
  };

  // 로컬스토리지에서 상태 복구
  const load = () => {
    try {
      const user = localStorage.getItem('user');
      if (user != null) {
        const parsed = JSON.parse(user);

        // 토큰이 있으면 복구, 없으면 초기화
        if (parsed?.token) {
          state.value = parsed;
        } else {
          state.value = { ...initState };
        }
      }
    } catch (e) {
      state.value = { ...initState };
    }
  };

  // 앱 시작 시 1회 복구
  load();

  return {
    state,
    id,
    isLogin,
    login,
    socialLogin,
    logout,
    getToken,
    setToken,
    getRefreshToken,
    load
  };
});
