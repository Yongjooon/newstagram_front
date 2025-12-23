<template>
  <main style="padding: 16px">
    <section style="display: flex; gap: 8px; margin-bottom: 12px">
      <div style="flex: 1"></div>

      <button type="button" @click="reload" :disabled="loading">
        새로고침
      </button>
    </section>

    <div v-if="loading" style="padding: 12px 0">불러오는 중...</div>
    <div v-else-if="errorMsg" style="padding: 12px 0; color: #c00">
      {{ errorMsg }}
    </div>

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
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import HomeApi from "../../api/HomeApi";
import LogApi from "../../api/LogApi";
import { useHomePeriodStore } from "../../stores/homePeriodStore";

const homePeriodStore = useHomePeriodStore();
const periodType = ref(homePeriodStore.period || "REALTIME");
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
    // 날짜 포맷 간단하게
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
/* ✅ 메인 컨테이너 */
.home-container {
  height: calc(100vh - 56px);
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

/* ✅ 피드 카드 (다크 글래스 스타일) 
     - 배경을 반투명한 검정으로 변경
     - backdrop-filter로 블러 효과 추가
  */
.feed-card {
  width: 100%;
  height: 100%;
  max-width: 100%;
  margin: 0 auto;

  /* [핵심 변경] 반투명한 어두운 배경 + 블러 효과 */
  background-color: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  /* 테두리를 아주 얇고 연한 흰색으로 주어 유리 느낌 강조 */
  border: 1px solid rgba(255, 255, 255, 0.1);

  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); /* 그림자도 조금 더 진하게 */

  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ✅ 헤더 */
.feed-header {
  padding: 16px 20px;
  /* 헤더 배경을 투명하게 하거나 카드와 동일하게 맞춤 */
  background: transparent;
  /* 구분선도 연한 투명 흰색으로 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

/* 탭 버튼 스타일 (다크 모드용) */
.tab-btn {
  border: 1px solid transparent;
  background: transparent;
  color: #888; /* 비활성 텍스트 */
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
}

.tab-btn.active {
  /* 활성화 시 흰색 배경에 검은 글씨, 혹은 그 반대 */
  background: #ffffff;
  color: #000000;
}

/* ✅ 본문 (스크롤 영역) */
.feed-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px 20px;
}

/* 스크롤바 커스텀 (다크 테마) */
.feed-body::-webkit-scrollbar {
  width: 6px;
}
.feed-body::-webkit-scrollbar-track {
  background: transparent;
}
.feed-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2); /* 스크롤바 색상 밝게 */
  border-radius: 3px;
}

.status-msg {
  padding: 24px 0;
  text-align: center;
  color: #999; /* 밝은 회색 */
}
.status-msg.error {
  color: #ff6b6b; /* 에러는 밝은 빨강 */
}

/* ✅ 기사 아이템 카드 */
.article-item {
  width: 100%;
  background: transparent;
  border: none;
  /* 리스트 구분선 연하게 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 20px 4px;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 0;
}

.article-item:last-child {
  border-bottom: none;
}

.article-item:hover {
  /* 호버 시 살짝 밝게 비치는 느낌 */
  background: rgba(255, 255, 255, 0.05);
}

/* 썸네일 스타일 */
.thumbnail-wrapper {
  width: 120px;
  flex: 0 0 120px;
}

.thumbnail-img {
  width: 120px;
  height: 84px;
  object-fit: cover;
  border-radius: 8px;
  /* 이미지 테두리 제거하거나 어둡게 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: block;
}

.thumbnail-placeholder {
  width: 120px;
  height: 84px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2); /* 어두운 배경 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 12px;
}

/* 텍스트 스타일 (다크 모드에 맞춰 밝게) */
.meta-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.date {
  font-size: 12px;
  color: #888; /* 연한 회색 */
}

.article-title {
  font-size: 17px;
  font-weight: 700;
  color: #f1f1f1; /* 거의 흰색 */
  margin: 0 0 8px 0;
  line-height: 1.35;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-desc {
  font-size: 14px;
  color: #b0b0b0 !important; /* 중간 톤 회색 */
  line-height: 1.5;
  margin: 0;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 더 불러오기 버튼 영역 */
.load-more-area {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}

.load-more-btn {
  border: none;
  background: rgba(255, 255, 255, 0.1); /* 반투명 버튼 */
  color: #ddd;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.load-more-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
.load-more-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

/* 새로고침 아이콘 버튼 스타일 */
.refresh-icon-btn {
  border: none;
  background: transparent;
  padding: 8px;
  border-radius: 50%;
  color: #888; /* 기본 색상 */
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
  background: rgba(255, 255, 255, 0.1);
  color: #fff; /* 호버 시 흰색 */
  transform: rotate(180deg);
}

.refresh-icon-btn:disabled {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}

/* 모달 스타일 (모달은 가독성을 위해 흰색 유지 or 다크로 변경 선택 가능) 
     여기서는 깔끔함을 위해 기존 흰색 유지하되 오버레이만 조정 */
.article-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75); /* 배경 더 어둡게 */
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
  background: #fff; /* 기사 본문은 가독성을 위해 흰색 유지 권장 */
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

@media (max-width: 640px) {
  .home-container {
    padding: 12px;
    height: calc(100vh - 56px);
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
