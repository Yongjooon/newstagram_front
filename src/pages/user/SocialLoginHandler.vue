<template>
    <div class="callback-page">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p>로그인 처리 중입니다...</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  
  onMounted(async () => {
    const { accessToken, refreshToken, initialized } = route.query;
    
    if (accessToken) {
      try {
        const user = {
            token: accessToken,
            refreshToken: refreshToken,
            initialized: initialized,
        };
        userStore.socialLogin(user);
        router.replace({ name: 'home' });
  
      } catch (error) {
        console.error('소셜 로그인 후처리 실패', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
        router.replace({ name: 'user' }); // 실패 시 로그인 페이지로 복귀
      }
    } else { // 토큰 없이 접근한 경우
      alert('잘못된 접근입니다.');
      router.replace({ name: 'user' });
    }
  });
  </script>
  
  <style scoped>
  .callback-page {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #FAFAFA;
  }
  
  .spinner-container {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #eee;
    border-top-color: #111; /* 로딩바 색상 (검정) */
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  p {
    color: #666;
    font-size: 14px;
    font-weight: 500;
    margin: 0;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  </style>