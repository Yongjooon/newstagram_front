<template>
  <aside class="sidenav" aria-label="Main navigation">
    <nav class="sidenav__nav">
      <div class="navgroup">
        <button :class="navBtnClass('home')" type="button" @click="goHome">
          메인
        </button>

        <div class="subnav">
          <button
            type="button"
            :class="subBtnClass(isHomeActivePeriod('REALTIME'))"
            @click="goHomeWithPeriod('REALTIME')"
          >
            실시간 이슈
          </button>
          <button
            type="button"
            :class="subBtnClass(isHomeActivePeriod('DAILY'))"
            @click="goHomeWithPeriod('DAILY')"
          >
            일간 이슈
          </button>
          <button
            type="button"
            :class="subBtnClass(isHomeActivePeriod('WEEKLY'))"
            @click="goHomeWithPeriod('WEEKLY')"
          >
            주간 이슈
          </button>
        </div>
      </div>

      <!-- 내꺼 -->
      <button :class="navBtnClass('my')" type="button" @click="goMy">
        내꺼
      </button>

      <!-- 부동산 -->
      <button :class="navBtnClass('budong')" type="button" @click="goBuDongSan">
        부동산
      </button>

      <!-- 프롬프트 + 하위 -->
      <div class="navgroup">
        <div style="display: flex; gap: 8px; align-items: center">
          <button
            :class="navBtnClass('prompt')"
            type="button"
            @click="goPrompt"
            style="flex: 1"
          >
            프롬프트
          </button>

          <button
            type="button"
            class="sidenav__btn"
            @click="toggleDeleteMode"
            :disabled="loadingHistory"
            style="width: auto; padding: 10px 12px; font-weight: 800"
            :title="deleteMode ? '삭제 모드 종료' : '삭제 모드'"
          >
            {{ deleteMode ? "완료" : "삭제" }}
          </button>
        </div>

        <div class="subnav">
          <div v-if="loadingHistory" class="subnav__empty">불러오는 중...</div>

          <div v-else-if="!historyItems.length" class="subnav__empty">
            검색 기록 없음
          </div>

          <div
            v-for="(item, idx) in historyItems"
            :key="`${item.id}-${idx}`"
            style="display: flex; align-items: center; gap: 8px"
          >
            <button
              type="button"
              class="subnav__btn"
              @click="goPromptWithQuery(item.query)"
              :title="item.query"
              style="flex: 1"
              :disabled="deletingId === item.id"
            >
              {{ item.query }}
            </button>

            <!-- 삭제 모드일 때만 - 버튼 -->
            <button
              v-if="deleteMode"
              type="button"
              class="subnav__btn"
              @click="onDelete(item.id)"
              :disabled="deletingId === item.id"
              style="width: 40px; padding: 8px 0; text-align: center"
              title="삭제"
            >
              {{ deletingId === item.id ? "..." : "-" }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="isAdmin" class="navgroup navgroup--admin">
        <button type="button" class="sidenav__btn" @click="openAdminModal">
          관리자 페이지
        </button>
      </div>
    </nav>

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
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useHomePeriodStore } from "@/stores/homePeriodStore";
import { usePromptStore } from "@/stores/promptStore";
import SurveyApi from "@/api/SurveyApi";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const route = useRoute();

const homePeriodStore = useHomePeriodStore();
const promptStore = usePromptStore();
const userStore = useUserStore();

const currentName = computed(() => route.name);

const loadingHistory = computed(() => !!promptStore.loadingHistory);

const deleteMode = ref(false);
const deletingId = ref(null);

const toggleDeleteMode = () => {
  deleteMode.value = !deleteMode.value;
};

onMounted(async () => {
  await promptStore.loadHistory({ force: false });
});

/* ---------- class helpers ---------- */
const navBtnClass = (name) => {
  const isActive = currentName.value === name;
  return ["sidenav__btn", isActive ? "is-active" : ""].join(" ");
};

const subBtnClass = (active) => {
  return ["subnav__btn", active ? "is-sub-active" : ""].join(" ");
};

/* ---------- state helpers ---------- */
const isHomeActivePeriod = (p) =>
  currentName.value === "home" && homePeriodStore.period === p;

const historyItems = computed(() => {
  const raw = Array.isArray(promptStore.historyRaw)
    ? promptStore.historyRaw
    : [];
  return raw
    .map((x) => ({
      id: x.id,
      query: (x.query || "").trim(),
    }))
    .filter((x) => x.id !== undefined && x.id !== null && x.query)
    .slice(0, 10);
});

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

/* ---------- navigation ---------- */
const goHome = () => router.push({ name: "home" });

const goHomeWithPeriod = async (period) => {
  homePeriodStore.setPeriod(period);
  await router.push({ name: "home" });
};

const goMy = async () => {
  try {
    const res = await SurveyApi.getUserEmbedding();
    if (res.data.initialized) {
      router.push({ name: "my" });
    } else {
      router.push({ name: "Survey" });
    }
  } catch (error) {
    console.error("유저 임베딩 데이터 조회 실패", error);
    alert("오류가 발생했습니다. 다시 시도해주세요.");
  }
};

const goPrompt = () => router.push({ name: "prompt" });

const goPromptWithQuery = async (q) => {
  const keyword = (q || "").trim();
  if (!keyword) return;

  await router.push({
    name: "prompt",
    query: { q: keyword },
  });
};

const goBuDongSan = () => router.push({ name: "budong" });

/* ---------- delete ---------- */
const onDelete = async (historyId) => {
  if (historyId === undefined || historyId === null) return;
  if (deletingId.value) return;

  deletingId.value = historyId;
  try {
    await promptStore.deleteHistoryById(historyId);
  } catch (e) {
    console.log(e);
    // 실패해도 UI가 망가지지 않게만 처리
  } finally {
    deletingId.value = null;
  }
};
</script>

<style scoped>
@media (max-width: 900px) {
  .sidenav {
    position: static;
    top: auto;
  }
}

.sidenav {
  position: sticky;
  top: 72px;
  align-self: start;
}

.sidenav__nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--panel);
  box-shadow: var(--shadow);
}

.sidenav__btn {
  width: 100%;
  text-align: left;
  border-radius: 12px;
  padding: 10px 12px;
  border: 1px solid transparent;
  background: transparent;
  font-weight: 800;
}

.sidenav__btn:hover {
  background: #fafafa;
  border-color: #e5e7eb;
}

.sidenav__btn.is-active {
  background: #111827;
  border-color: #111827;
  color: #fff;
}

/* 그룹 */
.navgroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 관리자 그룹 */
.navgroup--admin {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

/* 하위 메뉴 (항상 표시) */
.subnav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 10px;
}

/* 하위 버튼 */
.subnav__btn {
  width: 100%;
  text-align: left;
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  background: #fff;
  font-weight: 700;
  font-size: 13px;
}

.subnav__btn:hover {
  background: #fafafa;
  border-color: #d1d5db;
}

.subnav__btn.is-sub-active {
  background: #f3f4f6;
  border-color: #111827;
}

.subnav__empty {
  font-size: 12px;
  color: #6b7280;
  padding: 4px 2px;
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

.admin-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.admin-modal__title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}

.admin-modal__close {
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 800;
  cursor: pointer;
}

.admin-modal__body {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
}

.admin-modal__hint {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.admin-modal__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.admin-modal__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #111827;
  background: #111827;
  color: #fff;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 900;
  text-decoration: none;
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
