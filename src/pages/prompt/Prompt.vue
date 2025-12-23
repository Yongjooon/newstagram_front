<template>
  <main class="page-container">
    <section class="feed-card-layout">
      <header class="feed-header">
        <div class="folder-tab">
          <h2 class="desktop-label">
            🔍 {{ currentQuery ? currentQuery : "검색 결과" }}
          </h2>
        </div>

        <div class="header-right-area">
          <button
            type="button"
            class="refresh-icon-btn"
            @click="retrySearch"
            :disabled="!currentQuery || loadingSearch || loadingMore"
            aria-label="다시 검색"
            title="다시 검색"
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

      <div class="feed-body glass-panel-body">
        <div v-if="loadingSearch" class="status-msg">검색 중...</div>
        <div v-else-if="errorMsg" class="status-msg error">{{ errorMsg }}</div>

        <div v-if="!loadingSearch" class="content-wrapper">
          <div v-if="!articles.length" class="status-msg">
            검색 결과가 없습니다.
          </div>

          <div v-else class="article-list">
            <button
              v-for="a in articles"
              :key="a.id"
              type="button"
              class="article-item"
              @click="openArticle(a)"
              :title="a.url ? '클릭하면 모달로 기사 원문을 보여줍니다.' : ''"
            >
              <div style="display: flex; gap: 16px">
                <div class="thumbnail-wrapper">
                  <img
                    v-if="a.thumbnailUrl"
                    :src="a.thumbnailUrl"
                    alt="thumbnail"
                    class="thumbnail-img"
                  />
                  <div v-else class="thumbnail-placeholder">No Image</div>
                </div>

                <div style="flex: 1; min-width: 0; text-align: left">
                  <div class="meta-info">
                    <span class="date">
                      <span v-if="a.author" style="margin-right: 6px"
                        >by {{ a.author }}</span
                      >
                      {{ a.publishedAt ? formatDate(a.publishedAt) : "" }}
                    </span>
                  </div>

                  <h3 class="article-title">
                    {{ a.title }}
                  </h3>

                  <p class="article-desc">
                    {{ a.description || a.content }}
                  </p>
                </div>
              </div>
            </button>

            <div class="load-more-area">
              <button
                type="button"
                class="btn-glass"
                @click="loadMore"
                :disabled="loadingMore || !hasMore"
              >
                {{
                  loadingMore
                    ? "불러오는 중..."
                    : hasMore
                    ? "더 보기"
                    : "마지막입니다"
                }}
              </button>
            </div>
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
import { useRoute } from "vue-router";
import PromptApi from "../../api/PromptApi";
import LogApi from "../../api/LogApi";
import { usePromptStore } from "../../stores/promptStore";

const route = useRoute();
const promptStore = usePromptStore();

const LIMIT = 15;

const historyList = ref([]);
const loadingHistory = ref(false);

const currentQuery = ref("");
const selectedHistoryId = ref(null);

const articles = ref([]);
const page = ref(0);
const hasMore = ref(false);

const loadingSearch = ref(false);
const loadingMore = ref(false);
const errorMsg = ref("");

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

const closeModal = () => {
  modalOpen.value = false;
  iframeUrl.value = "";
  unlockBodyScroll();
  detachKeyListener();
};

const syncStoreHistoryFromApi = () => {
  const rawArr = Array.isArray(historyList.value) ? historyList.value : [];

  const normalizedRaw = rawArr
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const id = x.id ?? x.historyId ?? x.history_id ?? x.historyID;
      const query = String(x.query ?? x.keyword ?? x.q ?? "").trim();
      if (id === undefined || id === null) return null;
      if (!query) return null;
      return { id, query };
    })
    .filter(Boolean);

  const queries = normalizedRaw.map((x) => x.query);

  if (typeof promptStore.setRaw === "function") {
    promptStore.setRaw(normalizedRaw);
  }

  if (typeof promptStore.setHistory === "function") {
    promptStore.setHistory(queries);
  } else {
    promptStore.searchHistory.value = queries;
  }
};

const reloadHistory = async () => {
  loadingHistory.value = true;
  try {
    const data = await PromptApi.getPromptList();
    historyList.value = Array.isArray(data) ? data : [];
    syncStoreHistoryFromApi();
  } catch (e) {
    console.log(e);
  } finally {
    loadingHistory.value = false;
  }
};

const resetArticles = () => {
  articles.value = [];
  page.value = 0;
  hasMore.value = false;
  errorMsg.value = "";
};

const fetchArticles = async ({ query, nextPage, append }) => {
  errorMsg.value = "";

  const payload = {
    query,
    limit: LIMIT,
    page: nextPage,
  };

  const data = await PromptApi.getPrompt(payload);
  const list = Array.isArray(data) ? data : [];

  if (!append) articles.value = list;
  else articles.value = [...articles.value, ...list];

  hasMore.value = list.length === LIMIT;
  page.value = nextPage;
};

const runSearch = async (query) => {
  const q = (query || "").trim();
  if (!q) return;

  loadingSearch.value = true;
  resetArticles();

  try {
    currentQuery.value = q;

    if (typeof promptStore.addSearch === "function") {
      promptStore.addSearch(q);
    }

    await fetchArticles({ query: q, nextPage: 0, append: false });

    await reloadHistory();
  } catch (e) {
    console.log(e);
    errorMsg.value = "검색 중 오류가 발생했습니다.";
  } finally {
    loadingSearch.value = false;
  }
};

const loadMore = async () => {
  if (
    !currentQuery.value ||
    loadingSearch.value ||
    loadingMore.value ||
    !hasMore.value
  )
    return;

  loadingMore.value = true;
  try {
    const nextPage = page.value + 1;
    await fetchArticles({ query: currentQuery.value, nextPage, append: true });
  } catch (e) {
    console.log(e);
    errorMsg.value = "추가 로딩 중 오류가 발생했습니다.";
  } finally {
    loadingMore.value = false;
  }
};

const retrySearch = async () => {
  if (!currentQuery.value) return;
  await runSearch(currentQuery.value);
};

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

const openArticle = async (a) => {
  try {
    if (a?.id !== undefined && a?.id !== null) {
      await LogApi.addLog(a.id);
    }
  } catch (e) {
    console.log(e);
  }

  const url = (a?.url || "").trim();
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

watch(
  () => route.query.q,
  async (q) => {
    const keyword = (q || "").toString().trim();
    if (!keyword) return;
    if (keyword === currentQuery.value) return;

    selectedHistoryId.value = null;
    await runSearch(keyword);
  },
  { immediate: true }
);

onMounted(async () => {
  await reloadHistory();
});

onBeforeUnmount(() => {
  detachKeyListener();
  if (modalOpen.value) unlockBodyScroll();
});
</script>

<style scoped>
/* ✅ 레이아웃 (공통) */
.page-container {
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.feed-card-layout {
  width: 100%;
  height: 100%;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: visible;
}

/* ✅ 헤더 영역 (폴더 탭) */
.feed-header {
  display: flex;
  align-items: flex-end;
  height: 50px;
  flex-shrink: 0;
  position: relative;
  z-index: 5;
}

.folder-tab {
  background-color: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  border-radius: 16px 16px 0 0;

  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 100%;
  min-width: 200px;
  position: relative;
  top: 1px;
}

.desktop-label {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.header-right-area {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  padding-right: 16px;
  padding-bottom: 8px;
}

/* ✅ [추가] 새로고침 아이콘 버튼 */
.refresh-icon-btn {
  border: none;
  background: transparent;
  padding: 8px;
  border-radius: 50%;
  color: #aaa; /* 외부로 나가면서 색상 약간 밝게 */
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
  color: #fff;
  transform: rotate(180deg);
}
.refresh-icon-btn:disabled {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}

/* ✅ 본문 영역 (유리 패널) */
.feed-body.glass-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  background-color: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 24px 24px 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  z-index: 4;
}

/* 스크롤바 */
.feed-body::-webkit-scrollbar {
  width: 6px;
}
.feed-body::-webkit-scrollbar-track {
  background: transparent;
}
.feed-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* ✅ 기사 리스트 스타일 */
.content-wrapper {
  display: flex;
  flex-direction: column;
}

.article-list {
  display: flex;
  flex-direction: column;
}

.article-item {
  width: 100%;
  background: transparent;
  border: none;
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
  background: rgba(255, 255, 255, 0.05);
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: block;
}
.thumbnail-placeholder {
  width: 120px;
  height: 84px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 12px;
}

/* 텍스트 정보 */
.meta-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.date {
  font-size: 12px;
  color: #888;
}

.article-title {
  font-size: 17px;
  font-weight: 700;
  color: #f1f1f1;
  margin: 0 0 8px 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-desc {
  font-size: 14px;
  color: #b0b0b0 !important;
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

/* 버튼 스타일 (유리 질감) */
.btn-glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ccc;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-glass:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-glass:disabled {
  opacity: 0.5;
  cursor: default;
}

/* 로딩/에러 */
.status-msg {
  text-align: center;
  color: #999;
  padding: 40px;
}
.status-msg.error {
  color: #f87171;
}

/* 모달 */
.article-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
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
  background: #fff;
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

/* 모바일 반응형 */
@media (max-width: 900px) {
  .folder-tab {
    min-width: 0;
    border-radius: 16px 16px 0 0;
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
