<template>
  <div v-if="isOpen" class="mobile-overlay" @click="emit('close')"></div>

  <aside class="sidenav" :class="{ open: isOpen }" aria-label="Main navigation">
    <Admin />

    <nav class="sidenav__nav glass-panel">
      <simplebar class="nav-scroll-area">
        <div class="nav-content-inner">
          <div class="navgroup">
            <button
              :class="navBtnClass('home')"
              type="button"
              @click="handleNavClick('home')"
            >
              <span class="btn-icon">🏠</span>
              메인
            </button>

            <div class="subnav">
              <button
                type="button"
                :class="subBtnClass(isHomeActivePeriod('REALTIME'))"
                @click="handleNavClick('home', 'REALTIME')"
              >
                🔥 실시간 이슈
              </button>
              <button
                type="button"
                :class="subBtnClass(isHomeActivePeriod('DAILY'))"
                @click="handleNavClick('home', 'DAILY')"
              >
                📅 일간 이슈
              </button>
              <button
                type="button"
                :class="subBtnClass(isHomeActivePeriod('WEEKLY'))"
                @click="handleNavClick('home', 'WEEKLY')"
              >
                📆 주간 이슈
              </button>
            </div>
          </div>

          <button
            :class="navBtnClass('my')"
            type="button"
            @click="handleNavClick('my')"
          >
            <span class="btn-icon">👤</span>
            My 추천기사
          </button>

          <button
            :class="navBtnClass('budong')"
            type="button"
            @click="handleNavClick('budong')"
          >
            <span class="btn-icon">🏢</span>
            부동산
          </button>

          <div class="navgroup">
            <div style="display: flex; gap: 8px; align-items: center">
              <button
                :class="navBtnClass('prompt')"
                type="button"
                @click="handleNavClick('prompt')"
                style="flex: 1"
              >
                <span class="btn-icon">💬</span>
                프롬프트
              </button>

              <button
                type="button"
                class="mini-action-btn"
                @click="toggleDeleteMode"
                :disabled="loadingHistory"
                :title="deleteMode ? '완료' : '기록 삭제'"
              >
                {{ deleteMode ? "완료" : "관리" }}
              </button>
            </div>

            <div class="subnav history-list">
              <div v-if="loadingHistory" class="subnav__empty">
                불러오는 중...
              </div>
              <div v-else-if="!historyItems.length" class="subnav__empty">
                최근 기록 없음
              </div>

              <div
                v-for="(item, idx) in historyItems"
                :key="`${item.id}-${idx}`"
                class="history-item"
              >
                <button
                  type="button"
                  class="history-btn"
                  @click="handleHistoryClick(item.query)"
                  :title="item.query"
                  :disabled="deletingId === item.id"
                >
                  <span class="history-icon">🕒</span>
                  <span class="history-text">{{ item.query }}</span>
                </button>

                <button
                  v-if="deleteMode"
                  type="button"
                  class="delete-btn"
                  @click="onDelete(item.id)"
                  :disabled="deletingId === item.id"
                  title="삭제"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    width="14"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </simplebar>
    </nav>
  </aside>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useHomePeriodStore } from "@/stores/homePeriodStore";
import { usePromptStore } from "@/stores/promptStore";
import SurveyApi from "@/api/SurveyApi";
import Admin from "@/components/Admin.vue";

import simplebar from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";

defineProps({
  isOpen: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

const router = useRouter();
const route = useRoute();
const homePeriodStore = useHomePeriodStore();
const promptStore = usePromptStore();

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

/* ---------- Navigation Helpers ---------- */
const handleNavClick = async (target, period = null) => {
  if (target === "home") {
    if (period) homePeriodStore.setPeriod(period);
    await router.push({ name: "home" });
  } else if (target === "my") {
    try {
      const res = await SurveyApi.getUserEmbedding();
      if (res.data.initialized) router.push({ name: "my" });
      else router.push({ name: "Survey" });
    } catch (error) {
      alert("오류가 발생했습니다.");
    }
  } else if (target === "budong") {
    await router.push({ name: "budong" });
  } else if (target === "prompt") {
    await router.push({ name: "prompt" });
  }
  emit("close");
};

const handleHistoryClick = async (q) => {
  const keyword = (q || "").trim();
  if (keyword) {
    await router.push({ name: "prompt", query: { q: keyword } });
    emit("close");
  }
};

/* ---------- Class Helpers ---------- */
const navBtnClass = (name) => {
  const isActive = currentName.value === name;
  return ["sidenav__btn", isActive ? "is-active" : ""].join(" ");
};

const subBtnClass = (active) => {
  return ["subnav__btn", active ? "is-sub-active" : ""].join(" ");
};

const isHomeActivePeriod = (p) =>
  currentName.value === "home" && homePeriodStore.period === p;

const historyItems = computed(() => {
  const raw = Array.isArray(promptStore.historyRaw)
    ? promptStore.historyRaw
    : [];
  return raw
    .map((x) => ({ id: x.id, query: (x.query || "").trim() }))
    .filter((x) => x.id && x.query)
    .slice(0, 10);
});

const onDelete = async (historyId) => {
  if (!historyId || deletingId.value) return;
  deletingId.value = historyId;
  try {
    await promptStore.deleteHistoryById(historyId);
  } catch (e) {
    console.log(e);
  } finally {
    deletingId.value = null;
  }
};
</script>

<style scoped>
.sidenav {
  height: 100%;
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  z-index: 40;
  transition: transform 0.3s ease;
}

.glass-panel {
  flex: 1; /* 남은 공간 모두 차지 */
  min-height: 0; /* 내부 스크롤을 위해 필수 */

  display: flex;
  flex-direction: column;

  /* 패딩을 제거하고 내부 SimpleBar Content로 이동 */
  padding: 0;

  background-color: rgba(30, 30, 30, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);

  overflow: hidden; /* 둥근 모서리 밖으로 내용 나가지 않게 */
}

.nav-scroll-area {
  height: 100%;
}

.nav-content-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  padding-right: 12px; /* 스크롤바와 간격 확보 */
}

/* 스크롤바 커스텀 스타일 */
:deep(.simplebar-track.simplebar-vertical) {
  width: 8px;
  background: transparent;
  right: 1px;
  margin: 20px 0;
}

:deep(.simplebar-scrollbar::before) {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: opacity 0.2s linear;
  top: 2px;
  bottom: 2px;
}
/* 스크롤 중이거나 호버일 때만 보이게 설정 */
:deep(.simplebar-scrollbar.simplebar-visible::before) {
  opacity: 1;
}

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 90;
}

.sidenav__btn {
  width: 100%;
  text-align: left;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid transparent;
  background: transparent;
  font-weight: 700;
  color: #ccc;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}
.sidenav__btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}
.sidenav__btn.is-active {
  background: #ffffff;
  color: #000;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
}
.btn-icon {
  font-size: 16px;
}
.navgroup {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.subnav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 12px;
  margin-top: 4px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}
.subnav__btn {
  width: 100%;
  text-align: left;
  border-radius: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.subnav__btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}
.subnav__btn.is-sub-active {
  color: #72d6f5;
  font-weight: 700;
  background: rgba(114, 214, 245, 0.1);
}
.history-list {
  gap: 0;
}
.history-item {
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: background 0.2s;
}
.history-item:hover {
  background: rgba(255, 255, 255, 0.03);
}
.history-btn {
  flex: 1;
  text-align: left;
  background: transparent;
  border: none;
  padding: 8px 12px;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.history-btn:hover {
  color: #ddd;
}
.history-icon {
  font-size: 10px;
  opacity: 0.5;
}
.history-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mini-action-btn {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: #666;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
}
.mini-action-btn:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
}
.delete-btn {
  background: transparent;
  border: none;
  color: #ff6b6b;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}
.delete-btn:hover {
  opacity: 1;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 6px;
}
.subnav__empty {
  font-size: 12px;
  color: #555;
  padding: 8px 12px;
}

@media (max-width: 900px) {
  .sidenav {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
    z-index: 100;
    background: #0f0f0f;
    transform: translateX(-100%);
  }

  .sidenav.open {
    transform: translateX(0);
  }

  .mobile-overlay {
    display: block;
  }
}
</style>
