<template>
  <header class="topbar glass-panel">
    <div v-if="!isSearchMode" class="topbar__inner">
      <button
        class="topbar__menu"
        type="button"
        aria-label="Open navigation"
        @click="emit('toggle-nav')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <button
        class="topbar__brand"
        type="button"
        @click="goHome"
        aria-label="Go to Home"
      >
        {{ theme === "dark" ? "Newstagram" : "Newsreads" }}
      </button>

      <div v-if="!hidePrompt" class="topbar__prompt-desktop">
        <WritePrompt @submit="handleSubmitPrompt" />
      </div>
      <div v-else class="topbar__spacer"></div>

      <div class="topbar__actions">
        <button
          v-if="!hidePrompt"
          class="btn-icon mobile-search-trigger"
          type="button"
          @click="openMobileSearch"
          aria-label="검색 열기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M8.25 10.875a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0z"
            />
            <path
              fill-rule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.125 4.5a4.125 4.125 0 102.338 7.524l2.007 2.006a.75.75 0 101.06-1.06l-2.006-2.007a4.125 4.125 0 00-3.399-6.463z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <button
          type="button"
          class="theme-btn btn-glass"
          @click="toggleTheme"
          :title="theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'"
        >
          <svg
            v-if="theme === 'dark'"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="theme-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="theme-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        </button>

        <button
          class="btn-profile"
          type="button"
          @click="goMypage"
          aria-label="마이페이지"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M22 13C20.3431 13 19 14.3431 19 16C19 17.6569 20.3431 19 22 19C23.6569 19 25 17.6569 25 16C25 14.3431 23.6569 13 22 13ZM17 16C17 13.2386 19.2386 11 22 11C24.7614 11 27 13.2386 27 16C27 18.7614 24.7614 21 22 21C19.2386 21 17 18.7614 17 16ZM15.7784 24.15C17.7739 23.2555 20.184 23 22 23C23.816 23 26.2261 23.2555 28.2216 24.15C30.2529 25.0606 32 26.722 32 29.5V30.5C32 31.8546 30.9048 33 29.5183 33H14.4817C13.0952 33 12 31.8546 12 30.5V29.5C12 26.722 13.7471 25.0606 15.7784 24.15ZM16.5966 25.975C15.0029 26.6894 14 27.778 14 29.5V30.5C14 30.7821 14.2316 31 14.4817 31H29.5183C29.7684 31 30 30.7821 30 30.5V29.5C30 27.778 28.9971 26.6894 27.4034 25.975C25.7739 25.2445 23.684 25 22 25C20.316 25 18.2261 25.2445 16.5966 25.975Z"
              fill="currentColor"
            />
            <circle
              cx="22"
              cy="22"
              r="21"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </button>

        <button
          class="btn-logout"
          type="button"
          @click="handleLogout"
          aria-label="Sign out"
        >
          <span class="logout-text">Sign out</span>
          <svg
            class="logout-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <div v-else class="topbar__inner search-mode">
      <div class="topbar__prompt-mobile">
        <WritePrompt @submit="handleSubmitPrompt" />
      </div>
      <button class="btn-cancel" type="button" @click="closeMobileSearch">
        취소
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import UserApi from "@/api/UserApi";
import { useUserStore } from "@/stores/user";

import WritePrompt from "@/components/WritePrompt.vue";

import { useTheme } from "@/composables/useTheme";

const { theme, toggleTheme } = useTheme();

defineProps({
  hidePrompt: { type: Boolean, default: false },
});

const emit = defineEmits(["toggle-nav", "submit-prompt"]);

const router = useRouter();
const userStore = useUserStore();

// 모바일 검색 모드 상태 관리
const isSearchMode = ref(false);

const openMobileSearch = () => {
  isSearchMode.value = true;
};

const closeMobileSearch = () => {
  isSearchMode.value = false;
};

// 프롬프트 제출 핸들러
const handleSubmitPrompt = (text) => {
  emit("submit-prompt", text);
  // closeMobileSearch(); // 필요 시 활성화
};

const handleLogout = async () => {
  try {
    await UserApi.logout();
  } catch (e) {
    console.log(e);
  } finally {
    userStore.logout();
    router.push("/user");
  }
};

const goHome = () => router.push({ name: "home" });
const goMypage = () => router.push({ name: "mypage" });
</script>

<style scoped>
/* ✅ 헤더 전체 (유리 효과 적용) */
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 0;

  /* CSS 변수 적용 */
  background-color: var(--bg-panel);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-glass);
  box-shadow: var(--shadow-panel);
  transition: background-color 0.3s, border-color 0.3s;
}

.topbar__inner {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px; /* 좌우 여백 조정 */
  width: 100%;
  box-sizing: border-box;
}

/* 로고 (그라데이션 텍스트) */
.topbar__brand {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-weight: 900;
  font-size: 24px;
  letter-spacing: 0.05em;

  /* 로고 색상은 고정하거나 테마에 맞춰 미세 조정 */
  background: linear-gradient(
    90deg,
    var(--text-primary) 0%,
    var(--text-primary) 20%,
    var(--text-primary) 50%,
    var(--accent-color) 70%,
    #6c5ce7 80%,
    var(--text-primary) 100%
  );
  background-size: 200% auto;
  background-position: 0% 50%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  transition: background-position 0.1s ease-in-out;
  white-space: nowrap;
  margin-right: 12px;
}
.topbar__brand:hover {
  background-position: 100% 50%;
}

/* 데스크탑 검색창 */
.topbar__prompt-desktop {
  flex: 1;
  max-width: 640px;
  margin: 0 auto;
}
.topbar__spacer {
  flex: 1;
}

/* 모바일 검색 트리거 아이콘 */
.mobile-search-trigger {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  padding: 6px;
  color: var(--text-primary); /* 변수 사용 */
}

.mobile-search-trigger svg {
  width: 24px;
  height: 24px;
}

/* 햄버거 메뉴 버튼 (모바일) */
.topbar__menu {
  display: none;
  border: none;
  background: transparent;
  color: var(--text-primary); /* 변수 사용 */
  padding: 4px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

/* 로그아웃 버튼 */
.btn-logout {
  background: transparent;
  border: none;
  color: var(--text-primary); /* 변수 사용 */
  cursor: pointer;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}
.btn-logout:hover {
  opacity: 0.7;
}

.logout-text {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}
.logout-icon {
  display: none;
  width: 24px;
  height: 24px;
}

/* 우측 액션 영역 */
.topbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

/* 프로필 아이콘 */
.btn-profile {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.btn-profile img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 50%;
  border: 1px solid var(--border-glass); /* 테두리 추가 */
  transition: opacity 0.2s;
}
.btn-profile:hover {
  opacity: 0.8;
}

/* 테마 토글 버튼 (유리 스타일) */
.theme-btn {
  font-size: 18px;
  width: 24px; /* 크기 조정 */
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-button-glass);
  border: 1px solid var(--border-glass);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}
.theme-btn:hover {
  background: var(--border-glass);
}

/* -------------------------------------------
  모바일 검색 모드 스타일
------------------------------------------- */
.topbar__inner.search-mode {
  padding: 0 16px;
  gap: 8px;
  background: var(--bg-panel); /* 배경색 변수 사용 */
}

.topbar__prompt-mobile {
  flex: 1;
}

.btn-cancel {
  background: transparent;
  border: none;
  color: var(--text-secondary); /* 변수 사용 */
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  padding: 8px;
}
.btn-cancel:hover {
  color: var(--text-primary);
}

/* -------------------------------------------
  미디어 쿼리 (900px 이하 모바일)
------------------------------------------- */
@media (max-width: 900px) {
  .topbar__inner {
    padding: 0 16px;
  }

  .topbar__brand {
    font-size: 20px;
    margin-right: auto;
  }

  .topbar__menu {
    display: inline-flex;
  }

  .topbar__prompt-desktop {
    display: none;
  }

  .mobile-search-trigger {
    display: flex;
  }

  .logout-text {
    display: none;
  }
  .logout-icon {
    display: block;
  }

  .topbar__actions {
    margin-left: 0;
    gap: 4px;
  }
}
</style>
