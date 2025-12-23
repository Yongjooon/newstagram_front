<template>
  <div class="app-shell">
    <SnowCanvas />

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
/* ====== Global Reset & Variables ====== */
:root {
  --bg: #f6f7fb;
  --panel: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --line: #e5e7eb;
  --shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  --radius: 14px;
  --focus: 0 0 0 3px rgba(59, 130, 246, 0.25);

  --header-height: 56px;
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
  background: radial-gradient(circle at bottom, #0a0a15, #000);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
    Helvetica, Arial, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic",
    sans-serif;
  line-height: 1.45;
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

  /* 스크롤바 디자인 (Webkit) */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

/* ====== Content Area ====== */
.app-content-wrap {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 실제 콘텐츠가 들어가는 내부 래퍼 */
.app-content-inner {
  padding: 16px;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}

/* 비로그인 화면 (독립적 스크롤) */
.app-content--solo {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  display: flex;
  justify-content: center;
}
/* 비로그인 화면 내부 래퍼 */
.app-content--solo > * {
  max-width: 520px;
  width: 100%;
  margin: 20px auto;
  padding: 0 16px;
}

/* ====== Components Common Styles ====== */
.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
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
button {
  border: 1px solid var(--line);
  background: #fff;
  color: var(--text);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

/* ====== Mobile Responsive ====== */
@media (max-width: 900px) {
  .app-main {
    grid-template-columns: 1fr;
  }

  /* 사이드바를 Drawer 형태로 변경 */
  .app-nav-wrap {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    overflow-x: hidden;
    z-index: 100;
    border-right: 1px solid rgba(255, 255, 255, 0.1);

    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding-top: calc(var(--header-height) + 16px); /* 헤더 아래부터 시작 */
  }

  .app-nav-wrap.is-open {
    transform: translateX(0);
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
  }

  .nav-backdrop {
    position: fixed;
    inset: 0;
    z-index: 90;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(0.3px);
  }
}

/* 스크롤바 커스텀 (Chrome/Safari) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
