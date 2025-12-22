<template>
  <header class="topbar">
    <div class="topbar__inner">
      <button class="topbar__brand" type="button" @click="goHome" aria-label="Go to Home">
        Newstagram
      </button>

      <div class="topbar__spacer" />

      <div class="topbar__actions">
        <button class="btn-ghost" type="button" @click="goMypage">마이페이지</button>
        <button class="btn-primary" type="button" @click="handleLogout">로그아웃</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import UserApi from '../api/UserApi';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

const handleLogout = async () => {
  try {
    await UserApi.logout();
  } catch (e) {
    console.log(e);
  } finally {
    userStore.logout();
    router.push('/user');
  }
};

const goHome = () => router.push({ name: 'home' });
const goMypage = () => router.push({ name: 'mypage' });
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(246, 247, 251, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}

.topbar__inner {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
}

.topbar__brand {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-weight: 900;
  letter-spacing: -0.02em;
  font-size: 18px;
  color: var(--text);
}

.topbar__brand:hover {
  text-decoration: underline;
}

.topbar__spacer {
  flex: 1;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
