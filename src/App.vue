<template>
  <div class="app-shell">
    <!-- 로그인 상태 + 현재 라우트가 레이아웃 허용일 때만 노출 -->
    <Header v-if="showLayout" />

    <div v-if="showLayout" class="app-main">
      <Navi class="app-nav" />
      <main class="app-content" role="main">
        <!-- ✅ Mypage에서는 전역 WritePrompt 숨김 -->
        <section v-if="showGlobalPrompt" class="global-prompt card card--padded">
          <WritePrompt @submit="onGlobalSubmit" />
        </section>

        <router-view />
      </main>
    </div>

    <!-- 비로그인(로그인/회원가입/아이디·비번찾기 등) -->
    <main v-else class="app-content app-content--solo" role="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Header from '@/components/Header.vue';
import Navi from '@/components/Navi.vue';
import WritePrompt from '@/components/WritePrompt.vue';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

/**
 * userStore.isLogin 이 boolean일 수도 있고, RefImpl일 수도 있으니 방어적으로 처리.
 */
const isLoggedIn = computed(() => {
  const v = (userStore.isLogin && typeof userStore.isLogin === 'object' && 'value' in userStore.isLogin)
    ? userStore.isLogin.value
    : userStore.isLogin;

  return Boolean(v);
});

/**
 * 인증 화면에서는 레이아웃을 무조건 숨기기 위해 meta.hideLayout 지원
 */
const showLayout = computed(() => {
  if (route.meta?.hideLayout) return false;
  return isLoggedIn.value;
});

/**
 * ✅ 전역 WritePrompt 숨김 대상 라우트들
 * - Mypage.vue 라우트 name이 실제로 무엇인지에 따라 수정 필요
 */
const hidePromptOnRoutes = new Set([
  'mypage', // ← 여기만 "실제 라우트 name"으로 맞추면 됨
]);

const showGlobalPrompt = computed(() => {
  // 레이아웃이 보일 때만 전역 프롬프트도 고려
  if (!showLayout.value) return false;

  // meta로도 숨길 수 있게 지원 (선택)
  if (route.meta?.hideGlobalPrompt) return false;

  const name = route.name ? String(route.name) : '';
  return !hidePromptOnRoutes.has(name);
});

/**
 * 어떤 페이지에서든 검색하면 Prompt.vue로 이동해서 결과 표시
 */
const onGlobalSubmit = async (promptText) => {
  const q = (promptText || '').toString().trim();
  if (!q) return;

  await router.push({
    name: 'prompt',
    query: { q },
  });
};
</script>

<style>
/* ============ Base Reset ============ */
:root {
  --bg: #f6f7fb;
  --panel: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --line: #e5e7eb;
  --shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  --radius: 14px;
  --focus: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple SD Gothic Neo",
    "Noto Sans KR", "Malgun Gothic", sans-serif;
  line-height: 1.45;
}

/* ============ Layout ============ */
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
  padding: 16px;
}

.app-content {
  min-width: 0;
}

.app-content--solo {
  max-width: 520px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

/* ✅ Global Prompt Section */
.global-prompt {
  margin-bottom: 12px;
}

/* ============ Common UI ============ */
.container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.page {
  width: 100%;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 14px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.card--padded {
  padding: 16px;
}

.muted {
  color: var(--muted);
}

/* Forms */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field label {
  display: block;
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 6px;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  background: #fff;
  color: var(--text);
  outline: none;
}

input:focus,
select:focus,
textarea:focus {
  box-shadow: var(--focus);
  border-color: rgba(59, 130, 246, 0.7);
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}

/* Buttons */
button {
  appearance: none;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--text);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.04s ease, background 0.12s ease, border-color 0.12s ease;
}

button:hover {
  background: #fafafa;
  border-color: #d1d5db;
}

button:active {
  transform: translateY(1px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

.btn-primary:hover {
  background: #0b1220;
  border-color: #0b1220;
}

.btn-ghost {
  background: transparent;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--muted);
}

/* Responsive */
@media (max-width: 900px) {
  .app-main {
    grid-template-columns: 1fr;
    padding: 12px;
  }
}
</style>
