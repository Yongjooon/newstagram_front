<template>
  <div class="app-shell">
    <SnowCanvas />

    <!-- 로그인 상태 + 현재 라우트가 레이아웃 허용일 때만 노출 -->
    <Header v-if="showLayout" @toggle-nav="toggleNav" />

    <div v-if="showLayout" class="app-main">
      <!-- ✅ 기존 Navi 그대로 두되, 감싸는 래퍼만 추가 -->
      <div class="app-nav-wrap" :class="{ 'is-open': isNavOpen }">
        <Navi class="app-nav" />
      </div>

      <!-- ✅ 모바일에서만 오버레이 -->
      <div
        v-if="isMobile && isNavOpen"
        class="nav-backdrop"
        @click="closeNav"
        aria-hidden="true"
      />

      <main class="app-content" role="main">
        <!-- ✅ Mypage에서는 전역 WritePrompt 숨김 -->
        <section
          v-if="showGlobalPrompt"
          class="global-prompt card card--padded"
        >
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
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Navi from "@/components/Navi.vue";
import WritePrompt from "@/components/WritePrompt.vue";
import { useUserStore } from "@/stores/user";
import SnowCanvas from "./components/SnowCanvas.vue";

import { usePromptStore } from "@/stores/promptStore";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const promptStore = usePromptStore();

const isLoggedIn = computed(() => {
  const v =
    userStore.isLogin &&
    typeof userStore.isLogin === "object" &&
    "value" in userStore.isLogin
      ? userStore.isLogin.value
      : userStore.isLogin;

  return Boolean(v);
});

const showLayout = computed(() => {
  if (route.meta?.hideLayout) return false;
  return isLoggedIn.value;
});

const hidePromptOnRoutes = new Set(["mypage", "survey"]);

const showGlobalPrompt = computed(() => {
  if (!showLayout.value) return false;
  if (route.meta?.hideGlobalPrompt) return false;

  const name = route.name ? String(route.name) : "";
  return !hidePromptOnRoutes.has(name);
});

/* (유지) 히스토리 로딩 */
watch(
  () => showLayout.value,
  async (visible) => {
    if (visible) {
      await promptStore.loadHistory({ force: false });
    } else {
      promptStore.clearHistory();
    }
  },
  { immediate: true },
);

/* ✅ 모바일 네비 토글 */
const isNavOpen = ref(false);
const isMobile = ref(false);

function syncIsMobile() {
  isMobile.value = window.matchMedia("(max-width: 900px)").matches;
  if (!isMobile.value) isNavOpen.value = false;
}

function toggleNav() {
  if (!isMobile.value) return;
  isNavOpen.value = !isNavOpen.value;
}

function closeNav() {
  isNavOpen.value = false;
}

onMounted(() => {
  syncIsMobile();
  window.addEventListener("resize", syncIsMobile, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncIsMobile);
});

watch(
  () => route.fullPath,
  () => {
    if (isMobile.value) closeNav();
  },
);

const onGlobalSubmit = async (promptText) => {
  const q = (promptText || "").toString().trim();
  if (!q) return;

  await router.push({
    name: "prompt",
    query: { q },
  });
};
</script>

<style>
/* ====== 아래는 당신이 준 CSS를 "그대로" 유지 ====== */
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
  overscroll-behavior: none;
}

body {
  margin: 0;
  background: radial-gradient(circle at bottom, #0a0a15, #000);
  color: var(--text);
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    Helvetica,
    Arial,
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    sans-serif;
  line-height: 1.45;
}

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

.global-prompt {
  margin-bottom: 12px;
}

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

button {
  appearance: none;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--text);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 600;
  transition:
    transform 0.04s ease,
    background 0.12s ease,
    border-color 0.12s ease;
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

/* ✅ 당신이 준 responsive 유지 */
@media (max-width: 900px) {
  .app-main {
    grid-template-columns: 1fr;
    padding: 12px;
  }
}

/* ====== 여기부터 "추가"만 (기존 규칙 변경 없음) ====== */

/* ✅ 모바일에서만 Navi를 drawer로 숨김/표시 */
@media (max-width: 900px) {
  .app-nav-wrap {
    position: fixed;
    top: 56px; /* Header 높이 */
    left: 0;
    width: 78vw;
    max-width: 320px;
    height: calc(100vh - 56px);
    z-index: 60;

    transform: translateX(-110%);
    transition: transform 0.2s ease;
  }

  .app-nav-wrap.is-open {
    transform: translateX(0);
  }

  .nav-backdrop {
    position: fixed;
    inset: 0;
    z-index: 55;
    background: rgba(0, 0, 0, 0.35);
  }
}

/* ✅ 데스크톱에서는 wrapper가 레이아웃에 자연스럽게 들어가도록 */
.app-nav-wrap {
  /* grid 첫 번째 컬럼에 들어가며, 별도 스타일로 기존을 깨지 않음 */
}
</style>
