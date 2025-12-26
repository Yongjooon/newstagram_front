<template>
  <main class="home-container">
    <section class="feed-card">
      <header class="feed-header">
        <div style="display: flex; align-items: center; gap: 8px; width: 100%">
          <h2 class="desktop-label">
            {{ periodLabel }}
          </h2>

          <button
            type="button"
            :class="['tab-btn', { active: periodType === 'REALTIME' }]"
            @click="changePeriod('REALTIME')"
            :disabled="loading"
          >
            🔥 실시간
          </button>

          <button
            type="button"
            :class="['tab-btn', { active: periodType === 'DAILY' }]"
            @click="changePeriod('DAILY')"
            :disabled="loading"
          >
            일간
          </button>

          <button
            type="button"
            :class="['tab-btn', { active: periodType === 'WEEKLY' }]"
            @click="changePeriod('WEEKLY')"
            :disabled="loading"
          >
            주간
          </button>

          <div style="flex: 1"></div>

          <button
            type="button"
            class="refresh-icon-btn"
            @click="reload"
            :disabled="loading"
            aria-label="새로고침"
            title="새로고침"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
      </header>

      <div class="feed-body">
        <div v-if="loading && groups.length === 0" class="status-msg">
          이슈를 불러오는 중입니다...
        </div>

        <div v-else-if="errorMsg" class="status-msg error">
          {{ errorMsg }}
        </div>

        <div v-if="!loading && !groups.length" class="status-msg">
          표시할 이슈가 없습니다.
        </div>

        <div v-else style="display: flex; flex-direction: column; gap: 0">
          <button
            v-for="g in groups"
            :key="groupKey(g)"
            type="button"
            class="article-item"
            @click="openArticle(g.article)"
            :title="
              g.article?.url ? '클릭하면 모달로 기사 원문을 보여줍니다.' : ''
            "
          >
            <div style="display: flex; gap: 16px">
              <div class="thumbnail-wrapper">
                <img
                  v-if="g.article?.thumbnailUrl"
                  :src="g.article.thumbnailUrl"
                  alt="thumbnail"
                  class="thumbnail-img"
                />

                <div v-else class="thumbnail-placeholder">No Image</div>
              </div>

              <div style="flex: 1; min-width: 0; text-align: left">
                <div class="meta-info">
                  <span class="date">{{
                    g.article?.publishedAt
                      ? formatDate(g.article.publishedAt)
                      : ""
                  }}</span>
                </div>

                <h3 class="article-title">
                  {{ g.article?.title }}
                </h3>

                <p class="article-desc">
                  {{ g.article?.description || g.article?.content }}
                </p>
              </div>
            </div>
          </button>

          <div class="load-more-area">
            <button
              type="button"
              class="load-more-btn"
              @click="loadMore"
              :disabled="loadingMore || !hasNext"
            >
              {{
                loadingMore
                  ? "불러오는 중..."
                  : hasNext
                  ? "더 불러오기"
                  : "마지막입니다"
              }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <div
      v-if="modalOpen"
      class="article-modal__overlay"
      @click.self="closeModal"
      role="dialog"
      aria-modal="true"
    >
      <div class="article-modal__panel">
        <header class="article-modal__header">
          <span>기사 원문</span>

          <button type="button" @click="closeModal">닫기</button>
        </header>

        <iframe
          v-if="iframeUrl"
          :src="iframeUrl"
          class="article-modal__iframe"
          frameborder="0"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, computed } from "vue";
import HomeApi from "../../api/HomeApi";
import LogApi from "../../api/LogApi";
import { useHomePeriodStore } from "../../stores/homePeriodStore";

const homePeriodStore = useHomePeriodStore();
const periodType = ref(homePeriodStore.period || "REALTIME");

// 현재 선택된 기간에 따른 텍스트 라벨
const periodLabel = computed(() => {
  switch (periodType.value) {
    case "REALTIME":
      return "🔥 실시간 이슈";
    case "DAILY":
      return "📅 일간 이슈";
    case "WEEKLY":
      return "📆 주간 이슈";
    default:
      return "이슈";
  }
});

const cursor = ref(0);
const groups = ref([]);
const hasNext = ref(false);
const nextCursor = ref(0);
const loading = ref(false);
const loadingMore = ref(false);
const errorMsg = ref("");

let didMount = false;
const JTBC_PREFIX = "https://news.jtbc.co.kr/";

const modalOpen = ref(false);
const iframeUrl = ref("");
let __scrollY = 0;

const lockBodyScroll = () => {
  __scrollY = window.scrollY || 0;
  document.body.style.position = "fixed";
  document.body.style.top = `-${__scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
};

const unlockBodyScroll = () => {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflow = "";
  window.scrollTo(0, __scrollY);
};

const onKeyDown = (e) => {
  if (!modalOpen.value) return;
  if (e.key === "Escape") closeModal();
};

const attachKeyListener = () => window.addEventListener("keydown", onKeyDown);
const detachKeyListener = () =>
  window.removeEventListener("keydown", onKeyDown);

const openInNewWindowWithNotice = (url) => {
  alert("신문사 제한으로 외부창에서 기사를 띄웁니다.");
  if (url) window.open(url, "_blank", "noopener,noreferrer");
};

const groupKey = (g) =>
  `${g.groupId}-${g.rankInGroup}-${g.article?.id ?? "na"}`;

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return iso;
  }
};

const reset = () => {
  groups.value = [];
  cursor.value = 0;
  hasNext.value = false;
  nextCursor.value = 0;
  errorMsg.value = "";
};

const fetchPage = async ({ type, cur, append }) => {
  const data = await HomeApi.getArticles(type, cur);
  const list = Array.isArray(data?.groups) ? data.groups : [];
  const info = data?.pageInfo || {};

  if (!append) groups.value = list;
  else groups.value = [...groups.value, ...list];

  hasNext.value = !!info.hasNext;
  nextCursor.value = Number.isFinite(info.nextCursor) ? info.nextCursor : 0;
};

const loadInitial = async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    cursor.value = 0;
    await fetchPage({
      type: periodType.value,
      cur: cursor.value,
      append: false,
    });
    if (hasNext.value) cursor.value = nextCursor.value;
  } catch (e) {
    console.log(e);
    errorMsg.value = "이슈를 불러오는 중 오류가 발생했습니다.";
  } finally {
    loading.value = false;
  }
};

const changePeriod = async (type) => {
  if (periodType.value === type) return;
  homePeriodStore.setPeriod(type);
  periodType.value = type;
  reset();
  await loadInitial();
};

const reload = async () => {
  reset();
  await loadInitial();
};

const loadMore = async () => {
  if (!hasNext.value || loadingMore.value || loading.value) return;
  loadingMore.value = true;
  errorMsg.value = "";
  try {
    await fetchPage({
      type: periodType.value,
      cur: cursor.value,
      append: true,
    });
    if (hasNext.value) cursor.value = nextCursor.value;
  } catch (e) {
    console.log(e);
    errorMsg.value = "추가 로딩 중 오류가 발생했습니다.";
  } finally {
    loadingMore.value = false;
  }
};

const openArticle = async (article) => {
  try {
    if (article?.id !== undefined && article?.id !== null) {
      await LogApi.addLog(article.id);
    }
  } catch (e) {
    console.log(e);
  }

  const url = (article?.url || "").trim();
  if (!url) return;

  if (url.startsWith(JTBC_PREFIX)) {
    openInNewWindowWithNotice(url);
    return;
  }

  iframeUrl.value = url;
  modalOpen.value = true;
  lockBodyScroll();
  attachKeyListener();
};

const closeModal = () => {
  modalOpen.value = false;
  iframeUrl.value = "";
  unlockBodyScroll();
  detachKeyListener();
};

watch(
  () => homePeriodStore.period,
  async (p) => {
    if (!p) return;
    if (periodType.value === p) return;
    periodType.value = p;
    if (!didMount) return;
    reset();
    await loadInitial();
  }
);

onMounted(async () => {
  periodType.value = homePeriodStore.period || "REALTIME";
  await loadInitial();
  didMount = true;
});

onBeforeUnmount(() => {
  detachKeyListener();
  if (modalOpen.value) unlockBodyScroll();
});
</script>

<style scoped>
/* ✅ CSS 변수 적용 가이드 
  --bg-panel: 패널 배경 (유리 효과)
  --border-glass: 테두리 색상
  --shadow-panel: 그림자
  --text-primary: 기본 텍스트 (제목 등)
  --text-secondary: 보조 텍스트 (날짜, 설명 등)
  --divider: 구분선
  --bg-button-glass: 버튼 유리 배경
  --bg-input: 입력창/플레이스홀더 배경
  --error-color: 에러 메시지
*/

.home-container {
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* ✅ 피드 카드 (CSS 변수 적용) */
.feed-card {
  width: 100%;
  height: 100%;
  max-width: 100%;
  margin: 0 auto;

  background-color: var(--bg-panel); /* 변수 사용 */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  border: 1px solid var(--border-glass); /* 변수 사용 */
  border-radius: 24px;
  box-shadow: var(--shadow-panel); /* 변수 사용 */

  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background-color 0.3s, border-color 0.3s; /* 테마 전환 애니메이션 */
}

/* ✅ 헤더 */
.feed-header {
  padding: 12px 20px;
  background: transparent;
  border-bottom: 1px solid var(--divider); /* 변수 사용 */
  flex-shrink: 0;
}

/* ✅ PC 라벨 */
.desktop-label {
  display: block;
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary); /* 변수 사용 */
  letter-spacing: -0.02em;
}

/* ✅ 탭 버튼 (다크/라이트 모드 대응) */
.tab-btn {
  display: none; /* PC 숨김 */
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary); /* 변수 사용 */
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--bg-button-glass); /* 변수 사용 */
  color: var(--text-primary);
}

.tab-btn.active {
  /* 활성 상태: 텍스트색상 배경에 패널색상 글씨 (반전 효과) */
  background: var(--text-primary);
  color: var(--bg-panel); /* 혹은 정해진 배경색 */
}

/* ✅ 본문 */
.feed-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px 20px;
}

/* 스크롤바 */
.feed-body::-webkit-scrollbar {
  width: 6px;
}
.feed-body::-webkit-scrollbar-track {
  background: transparent;
}
.feed-body::-webkit-scrollbar-thumb {
  background: var(--border-glass); /* 변수 사용 (테두리색 활용) */
  border-radius: 3px;
}

.status-msg {
  padding: 24px 0;
  text-align: center;
  color: var(--text-secondary); /* 변수 사용 */
}
.status-msg.error {
  color: var(--error-color); /* 변수 사용 */
}

/* ✅ 기사 아이템 */
.article-item {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--divider); /* 변수 사용 */
  padding: 20px 4px;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 0;
}
.article-item:last-child {
  border-bottom: none;
}
.article-item:hover {
  background: var(--bg-button-glass); /* 변수 사용 */
}

/* 썸네일 */
.thumbnail-wrapper {
  width: 120px;
  flex: 0 0 120px;
}
.thumbnail-img {
  width: 120px;
  height: 84px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-glass); /* 변수 사용 */
  display: block;
}
.thumbnail-placeholder {
  width: 120px;
  height: 84px;
  border-radius: 8px;
  border: 1px solid var(--border-glass); /* 변수 사용 */
  background: var(--bg-input); /* 변수 사용 (입력창 배경색 활용) */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary); /* 변수 사용 */
  font-size: 12px;
}

/* 텍스트 스타일 */
.meta-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.date {
  font-size: 12px;
  color: var(--text-secondary); /* 변수 사용 */
}
.article-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary); /* 변수 사용 */
  margin: 0 0 8px 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.article-desc {
  font-size: 14px;
  color: var(--text-secondary) !important; /* 변수 사용 */
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 더 불러오기 */
.load-more-area {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}
.load-more-btn {
  border: none;
  background: var(--bg-button-glass); /* 변수 사용 */
  color: var(--text-secondary); /* 변수 사용 */
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.load-more-btn:hover {
  background: var(--border-glass); /* 조금 더 진하게 */
  color: var(--text-primary);
}
.load-more-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

/* 새로고침 아이콘 */
.refresh-icon-btn {
  border: none;
  background: transparent;
  padding: 8px;
  border-radius: 50%;
  color: var(--text-secondary); /* 변수 사용 */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.refresh-icon-btn svg {
  width: 24px;
  height: 24px;
}
.refresh-icon-btn:hover {
  background: var(--bg-button-glass);
  color: var(--text-primary);
  transform: rotate(180deg);
}
.refresh-icon-btn:disabled {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}

/* 모달 스타일 (기본적으로 흰색 유지하되 오버레이만 조정) */
.article-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75); /* 오버레이는 항상 어둡게 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  backdrop-filter: blur(5px);
}
.article-modal__panel {
  width: min(1000px, 100%);
  height: 85vh;
  background: #fff; /* 기사 가독성을 위해 흰색 고정 (iframe 내부 제어 불가) */
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
.article-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #eee;
  font-weight: 700;
  font-size: 16px;
  color: #333;
  background: #fff;
}
.article-modal__header button {
  border: none;
  background: #f1f1f1;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}
.article-modal__iframe {
  flex: 1;
  width: 100%;
  height: 100%;
  border: 0;
}

/* 모바일 반응형 */
@media (max-width: 900px) {
  /* 브레이크포인트 맞춤 */
  .home-container {
    padding: 12px;
    height: calc(100vh - 56px);
  }

  .tab-btn {
    display: block;
  }
  .desktop-label {
    display: none;
  }

  .article-modal__overlay {
    padding: 0;
  }
  .article-modal__panel {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
}
</style>
