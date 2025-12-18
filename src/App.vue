<template>
  <!-- 로그인 상태에서만 노출 -->
  <Header v-if="isLoggedIn" />
  <Navi v-if="isLoggedIn" />

  <!-- 페이지 -->
  <router-view />
</template>

<script setup>
import { computed } from 'vue';
import Header from '@/components/Header.vue';
import Navi from '@/components/Navi.vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// store의 isLogin이 computed로 userId를 리턴하므로 boolean으로 변환
const isLoggedIn = computed(() => !!userStore.isLogin);
</script>
