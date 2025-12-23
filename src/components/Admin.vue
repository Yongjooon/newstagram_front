<!-- src/components/Admin.vue -->
<template>
  <!-- ✅ ADMIN일 때만 보이도록 -->
  <aside v-if="isAdmin" class="admin-bar" aria-label="Admin bar">
    <button class="admin-btn" type="button" @click="openAdminModal">
      관리자 페이지
    </button>

    <!-- ✅ 모달은 Admin.vue로 이동 -->
    <teleport to="body">
      <div
        v-if="adminModalOpen"
        class="admin-modal__backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="closeAdminModal"
      >
        <section class="admin-modal">
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
  </aside>
</template>

<script setup>
import { computed, ref } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const role = computed(() => userStore?.state?.user?.role || "");
const isAdmin = computed(() => role.value === "ADMIN");

const adminModalOpen = ref(false);

const CLOUDWATCH_URL = import.meta.env.VITE_CLOUDWATCH_DASHBOARD_URL;

const openAdminModal = () => {
  adminModalOpen.value = true;
};

const closeAdminModal = () => {
  adminModalOpen.value = false;
};
</script>

<style scoped>
.admin-bar {
  padding: 12px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--panel);
  box-shadow: var(--shadow);
}

.admin-btn {
  width: 100%;
  padding: 10px 12px;
  font-weight: 800;
  border-radius: 12px;
  background: #111827;
  border-color: #111827;
  color: #fff;
  cursor: pointer;
}

/* ===== 관리자 모달 ===== */
.admin-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.admin-modal {
  width: min(1100px, 100%);
  height: min(720px, 100%);
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.admin-modal__body {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
}

.admin-modal__frame-wrap {
  flex: 1;
  min-height: 0;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.admin-modal__frame {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
