<!-- src/components/Header.vue -->
<template>
  <header class="topbar">
    <div class="topbar__inner">
      <!-- 모바일 메뉴 버튼 -->
      <button
        class="topbar__menu"
        type="button"
        aria-label="Open navigation"
        @click="$emit('toggle-nav')"
      >
        ☰
      </button>

      <!-- 브랜드 -->
      <button
        class="topbar__brand"
        type="button"
        @click="goHome"
        aria-label="Go to Home"
      >
        Newstagram
      </button>

      <!-- ✅ 프롬프트 입력창 (한 줄 중앙) -->
      <div v-if="!hidePrompt" class="topbar__prompt-inline">
        <WritePrompt @submit="handleSubmitPrompt" />
      </div>

      <!-- 오른쪽 액션 -->
      <div class="topbar__actions">
        <button
          class="btn-profile"
          type="button"
          @click="goMypage"
          aria-label="마이페이지"
        >
          <img :src="profileIcon" alt="Profile" />
        </button>
        <button class="btn-logout" type="button" @click="handleLogout">
          Sign out
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
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

const handleSubmitPrompt = (text) => {
  emit("submit-prompt", text);
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
  backdrop-filter: blur(10px);
}

.topbar__inner {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 32px;
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
  white-space: nowrap;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

/* ✅ 프롬프트 인라인 */
.topbar__prompt-inline {
  flex: 1;
  max-width: 640px;
}

/* 모바일 메뉴 버튼 */
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

.btn-profile {
  /* 1. 기존 버튼 스타일 강제 초기화 */
  background: transparent !important; /* 배경 투명 */
  border: none !important; /* 테두리 제거 */
  box-shadow: none !important; /* 그림자 제거 */
  padding: 0 !important; /* 패딩 제거 (아이콘 크기에 딱 맞게) */

  /* 2. 아이콘 배치 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 이미지 크기 조절 */
.btn-profile img {
  width: 32px; /* 원하는 아이콘 크기로 조절하세요 */
  height: 32px;
  object-fit: contain;

  /* (선택사항) SVG가 검은색이라 안 보이면 아래 필터로 흰색 만들기 */
  /* filter: invert(100%); */

  transition: opacity 0.2s;
}

/* 3. 호버 효과 (배경색 대신 투명도나 크기로 반응) */
.btn-profile:hover {
  opacity: 0.8; /* 살짝 흐리게 */
  /* transform: scale(1.05);  /* 또는 살짝 커지게 */
}

.btn-logout {
  background: transparent;
  border: none;
  box-shadow: none;

  color: #ffffff;
  font-weight: 300;
  font-size: 14px;

  /* 중심축을 가운데로 설정 (안 하면 위치가 조금 틀어질 수 있음) */
  transform-origin: center;

  /* 텍스트가 렌더링될 때 블러 처리 방지 (선택사항) */
  -webkit-font-smoothing: antialiased;

  cursor: pointer;
  padding: 0 8px;

  /* 마진을 줘서 주변 요소와 간격 조절 (늘어난 만큼 공간 확보) */
  margin-top: 2px;

  transition: opacity 0.2s;
}

.btn-logout:hover {
  opacity: 0.7;
}

@media (max-width: 900px) {
  .topbar__menu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
