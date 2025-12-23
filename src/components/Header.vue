<template>
  <header class="topbar">
    <div v-if="!isSearchMode" class="topbar__inner">
      <button
        class="topbar__menu"
        type="button"
        aria-label="Open navigation"
        @click="emit('toggle-nav')"
      >
        ☰
      </button>

      <button
        class="topbar__brand"
        type="button"
        @click="goHome"
        aria-label="Go to Home"
      >
        Newstagram
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
          class="btn-profile"
          type="button"
          @click="goMypage"
          aria-label="마이페이지"
        >
          <img :src="profileIcon" alt="Profile" />
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
import profileIcon from "@/assets/profile_icon.svg";

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

// 프롬프트 제출 핸들러 (제출 후 모바일 검색 모드 닫기 포함)
const handleSubmitPrompt = (text) => {
  emit("submit-prompt", text);
  // 검색 후 검색창을 닫고 싶다면 아래 주석 해제
  // closeMobileSearch();
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
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 10px;
}

.topbar__inner {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 32px;
  width: 100%;
  box-sizing: border-box;
}

/* 로고 */
.topbar__brand {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-weight: 900;
  font-size: 24px;
  letter-spacing: 0.05em;
  background: linear-gradient(
    90deg,
    #ffffff 0%,
    #ffffff 20%,
    #ffffff 50%,
    #72d6f5 70%,
    #6c5ce7 80%,
    #ffffff 100%
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

/* -------------------------------------------
  데스크탑 / 모바일 요소 제어 (Desktop first)
------------------------------------------- */

/* 데스크탑 검색창 (기본 보임) */
.topbar__prompt-desktop {
  flex: 1;
  max-width: 640px;
  margin: 0 auto;
}
.topbar__spacer {
  flex: 1;
}

/* 모바일 검색 트리거 버튼 (기본 숨김) */
.mobile-search-trigger {
  display: none; /* 데스크탑에서는 숨김 */
  background: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  padding: 6px;
  color: #fff;
}

.mobile-search-trigger svg {
  width: 28px;
  height: 28px;
}

/* 모바일 메뉴 버튼 (기본 숨김) */
.topbar__menu {
  display: none;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--text);
  border-radius: 12px;
  padding: 8px 10px;
  cursor: pointer;
  font-weight: 800;
  line-height: 1;
}

/* 로그아웃 버튼 (텍스트/아이콘 스위칭) */
.btn-logout {
  background: transparent;
  border: none;
  color: #ffffff;
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

/* 데스크탑: 텍스트 보임, 아이콘 숨김 */
.logout-text {
  font-weight: 300;
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
  transition: opacity 0.2s;
}
.btn-profile:hover {
  opacity: 0.8;
}

/* -------------------------------------------
  모바일 검색 모드 스타일
------------------------------------------- */
.topbar__inner.search-mode {
  padding: 0 16px;
  gap: 8px;
  background: rgba(0, 0, 0, 0.4); /* 모드 진입 시 배경 살짝 어둡게 */
}

.topbar__prompt-mobile {
  flex: 1; /* 검색창이 남은 공간 꽉 채움 */
}

.btn-cancel {
  background: transparent;
  border: none;
  color: #ccc;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  padding: 8px;
}
.btn-cancel:hover {
  color: #fff;
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
    margin-right: auto; /* 로고 왼쪽 정렬 유지 */
  }

  .topbar__menu {
    display: inline-flex; /* 메뉴 버튼 보임 */
  }

  /* 데스크탑 검색창 숨김 */
  .topbar__prompt-desktop {
    display: none;
  }

  /* 모바일 검색 트리거 아이콘 보임 */
  .mobile-search-trigger {
    display: flex;
  }

  /* 로그아웃: 텍스트 숨김, 아이콘 보임 */
  .logout-text {
    display: none;
  }
  .logout-icon {
    display: block;
  }

  /* 마진 조정 */
  .topbar__actions {
    margin-left: 0;
    gap: 4px;
  }
}
</style>
