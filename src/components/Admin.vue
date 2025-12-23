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
        <section class="admin-modal-panel">
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
import { computed, ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const role = computed(() => userStore?.state?.user?.role || "");
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
.admin-bar {
  width: 100%;
  margin-bottom: 16px;
  padding: 16px;
  background-color: rgba(40, 30, 30, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  border: 1px solid rgba(255, 100, 100, 0.2);
  border-radius: 24px;

  box-shadow: 0 8px 32px 0 rgba(255, 80, 80, 0.1);

  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box; /* 패딩 포함 크기 계산 */
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
  color: #ff8a80;
}

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

.admin-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  cursor: pointer;

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

.admin-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.admin-modal-panel {
  width: min(1100px, 100%);
  height: min(720px, 90vh);
  background: #1e1e1e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.admin-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-modal__header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.close-btn {
  background: transparent;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}
.close-btn:hover {
  color: #fff;
}

.admin-modal__body {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
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
