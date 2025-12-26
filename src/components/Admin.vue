<template>
  <div v-if="isAdmin" class="admin-bar" aria-label="Admin bar">
    <div class="admin-header">
      <span class="admin-label">Administrator</span>
      <div class="status-dot"></div>
    </div>

    <button class="admin-btn" type="button" @click="openAdminModal">
      <span class="btn-icon">⚙️</span>
      관리자 대시보드
    </button>

    <teleport to="body">
      <div
        v-if="adminModalOpen"
        class="admin-modal__backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="closeAdminModal"
      >
        <section class="admin-modal-panel glass-panel">
          <header class="admin-modal__header">
            <h3>CloudWatch Monitoring</h3>
            <button type="button" class="close-btn" @click="closeAdminModal">
              ✕
            </button>
          </header>

          <div class="admin-modal__body">
            <div class="admin-modal__frame-wrap">
              <iframe
                class="admin-modal__frame"
                :src="CLOUDWATCH_URL"
                title="CloudWatch Dashboard"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
            </div>
          </div>
        </section>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

// Pinia State 접근 방식 안전하게 처리
const role = computed(() => {
  if (userStore.user && userStore.user.role) return userStore.user.role;
  // state 구조가 다를 경우 대비 (userStore.state.user...)
  return userStore.state?.user?.role || "";
});

const isAdmin = computed(() => role.value === "ADMIN");

const adminModalOpen = ref(false);
const CLOUDWATCH_URL = import.meta.env.VITE_CLOUDWATCH_DASHBOARD_URL || "";

const openAdminModal = () => {
  adminModalOpen.value = true;
};

const closeAdminModal = () => {
  adminModalOpen.value = false;
};
</script>

<style scoped>
/* ✅ 관리자 바 (유리 효과 + 붉은 테두리 강조) */
.admin-bar {
  width: 100%;
  margin-bottom: 16px;
  padding: 16px;

  /* 테마 변수 적용 */
  background-color: var(--bg-panel);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  /* 관리자 전용 붉은 테두리 유지 (error-color 활용 가능하지만 고정값 추천) */
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 24px;

  box-shadow: 0 8px 32px 0 rgba(255, 80, 80, 0.1);

  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.admin-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #ff6b6b; /* 관리자 강조색은 고정 */
}

/* 상태 표시 점 (애니메이션) */
.status-dot {
  width: 8px;
  height: 8px;
  background-color: #ff5252;
  border-radius: 50%;
  box-shadow: 0 0 8px #ff5252;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* ✅ 관리자 버튼 */
.admin-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  cursor: pointer;

  /* 그라데이션 버튼 유지 */
  background: linear-gradient(135deg, #ff9a9e 0%, #ff6b6b 100%);

  color: #fff;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  transition: all 0.2s ease;
}

.admin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
  filter: brightness(1.1);
}

.admin-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 16px;
}

/* ✅ 모달 백드롭 */
.admin-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.75); /* 배경은 항상 어둡게 */
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

/* ✅ 모달 패널 (테마 적용) */
.admin-modal-panel {
  width: min(1100px, 100%);
  height: min(720px, 90vh);

  /* 테마 변수 적용 */
  background-color: var(--bg-panel);
  border: 1px solid var(--border-glass);

  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

/* 모달 헤더 */
.admin-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;

  background-color: var(--bg-button-glass);
  border-bottom: 1px solid var(--border-glass);
}

.admin-modal__header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary); /* 텍스트 색상 변수 */
}

/* 닫기 버튼 */
.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}
.close-btn:hover {
  color: var(--text-primary);
}

/* 모달 바디 */
.admin-modal__body {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff; /* iframe 내부가 보통 흰색이므로 흰색 고정 (다크모드여도) */
}

.admin-modal__frame-wrap {
  flex: 1;
  width: 100%;
  height: 100%;
}

.admin-modal__frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
</style>
