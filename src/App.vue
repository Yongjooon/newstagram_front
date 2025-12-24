<template>
  <div class="app-shell">
    <SnowCanvas v-if="theme === 'dark'" />
    <SunCanvas v-else />

    <Header
      v-if="showLayout"
      @toggle-nav="toggleNav"
      @submit-prompt="onGlobalSubmit"
      :hide-prompt="!showGlobalPrompt"
      class="app-header"
    />

    <div
      v-if="showLayout"
      class="app-main"
      :class="{ 'is-no-sidenav': hideSideNav }"
    >
      <aside
        v-if="!hideSideNav"
        class="app-nav-wrap"
        :class="{ 'is-open': isNavOpen }"
      >
        <Navi :is-open="isNavOpen" @close="closeNav" class="app-nav" />
      </aside>

      <div
        v-if="!hideSideNav && isMobile && isNavOpen"
        class="nav-backdrop"
        @click="closeNav"
        aria-hidden="true"
      />

      <main class="app-content-wrap" role="main">
        <div class="app-content-inner">
          <router-view />
        </div>
      </main>
    </div>

    <main v-else class="app-content--solo" role="main">
      <router-view />
    </main>

    <Footer class="app-footer" />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Navi from "@/components/Navi.vue";
import Footer from "@/components/Footer.vue";
import { useUserStore } from "@/stores/user";
import SnowCanvas from "./components/SnowCanvas.vue";
import SunCanvas from "./components/SunCanvas.vue";
import { usePromptStore } from "@/stores/promptStore";
import { useTheme } from "@/composables/useTheme"; // ✅ import 추가

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const promptStore = usePromptStore();

// ✅ 테마 상태 가져오기
const { theme, initTheme } = useTheme();

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

const hideSideNavOnRoutes = new Set(["mypage"]);
const hidePromptOnRoutes = new Set(["mypage", "survey"]);

const routeName = computed(() => (route.name ? String(route.name) : ""));

const hideSideNav = computed(() => hideSideNavOnRoutes.has(routeName.value));

const showGlobalPrompt = computed(() => {
  if (!showLayout.value) return false;
  if (route.meta?.hideGlobalPrompt) return false;
  return !hidePromptOnRoutes.has(routeName.value);
});

watch(
  () => showLayout.value,
  async (visible) => {
    if (visible) {
      await promptStore.loadHistory({ force: false });
    } else {
      promptStore.clearHistory();
    }
  },
  { immediate: true }
);

const isNavOpen = ref(false);
const isMobile = ref(false);

function syncIsMobile() {
  isMobile.value = window.matchMedia("(max-width: 900px)").matches;
  if (!isMobile.value) isNavOpen.value = false;
}

function toggleNav() {
  if (!isMobile.value) return;
  if (hideSideNav.value) return;
  isNavOpen.value = !isNavOpen.value;
}

function closeNav() {
  isNavOpen.value = false;
}

onMounted(() => {
  initTheme(); // ✅ 테마 초기화 실행
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
  }
);

watch(
  () => hideSideNav.value,
  (v) => {
    if (v) isNavOpen.value = false;
  },
  { immediate: true }
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
/* ====== Global Theme Variables ====== */
:root {
  /* 🌑 다크 모드 (기본) */
  --bg-app: radial-gradient(circle at bottom, #0a0a15, #000);
  --bg-panel: rgba(30, 30, 30, 0.65);
  --bg-input: rgba(0, 0, 0, 0.3);
  --bg-button-glass: rgba(255, 255, 255, 0.05);
  --bg-sidebar-mobile: #0f0f0f;

  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  --text-placeholder: #6b7280;

  --border-glass: rgba(255, 255, 255, 0.1);
  --divider: rgba(255, 255, 255, 0.1);

  --accent-color: #72d6f5;
  --success-color: #4ade80;
  --error-color: #f87171;

  --shadow-panel: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  --radius: 14px;
  --header-height: 56px;
}

/* ☀️ 라이트 모드 (html[data-theme="light"]) */
html[data-theme="light"] {
  --bg-app: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  --bg-panel: rgba(255, 255, 255, 0.65);
  --bg-input: rgba(255, 255, 255, 0.6);
  --bg-button-glass: rgba(255, 255, 255, 0.4);
  --bg-sidebar-mobile: #ffffff;

  --text-primary: #1f2937;
  --text-secondary: #4b5563;
  --text-placeholder: #9ca3af;

  --border-glass: rgba(0, 0, 0, 0.08);
  --divider: rgba(0, 0, 0, 0.1);

  --shadow-panel: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  background: var(--bg-app);
  color: var(--text-primary);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
    Helvetica, Arial, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic",
    sans-serif;
  line-height: 1.45;
  transition: background 0.3s ease, color 0.3s ease;
}

/* ====== App Shell Structure ====== */
.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  flex-shrink: 0;
  z-index: 50;
}

.app-footer {
  flex-shrink: 0;
  z-index: 50;
}

.app-main {
  flex: 1;
  min-height: 0;

  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0;

  position: relative;
  overflow: hidden;
}

.app-main.is-no-sidenav {
  grid-template-columns: 1fr;
}

/* ====== Sidebar Area ====== */
.app-nav-wrap {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  scrollbar-width: thin;
  scrollbar-color: var(--border-glass) transparent;
}

/* ====== Content Area ====== */
.app-content-wrap {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
}

.app-content-inner {
  padding: 16px;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}

.app-content--solo {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  display: flex;
  justify-content: center;
}
.app-content--solo > * {
  max-width: 520px;
  width: 100%;
  margin: 20px auto;
  padding: 0 16px;
}

/* ====== Global Components Style Overrides ====== */
input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
  transition: background 0.2s, border-color 0.2s;
}

input::placeholder {
  color: var(--text-placeholder);
}

button {
  border: 1px solid var(--border-glass);
  background: var(--bg-button-glass);
  color: var(--text-primary);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

button:hover {
  background: var(--border-glass);
}

.btn-primary {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

.card {
  background: var(--bg-panel);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius);
  box-shadow: var(--shadow-panel);
  color: var(--text-primary);
}

/* ====== Mobile Responsive ====== */
@media (max-width: 900px) {
  .app-main {
    grid-template-columns: 1fr;
  }

  .app-nav-wrap {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    overflow-x: hidden;
    z-index: 100;
    background: var(--bg-sidebar-mobile);
    border-right: 1px solid var(--border-glass);

    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding-top: calc(var(--header-height) + 16px);
  }

  .app-nav-wrap.is-open {
    transform: translateX(0);
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
  }

  .nav-backdrop {
    position: fixed;
    inset: 0;
    z-index: 90;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
  }
}

/* 스크롤바 커스텀 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border-glass);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.5);
}
</style>
