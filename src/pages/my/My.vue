<template>
  <main class="page-container">
    <section class="glass-panel">
      <header class="panel-header">
        <div style="display: flex; gap: 8px; align-items: center; width: 100%">
          <h2 class="desktop-label">My 추천기사</h2>
          <div style="flex: 1"></div>
          <button
            type="button"
            class="refresh-icon-btn"
            @click="reload"
            :disabled="loading || loadingMore"
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

      <div class="panel-body">
        <div v-if="loading" class="status-msg">불러오는 중...</div>
        <div v-else-if="errorMsg" class="status-msg error">
          {{ errorMsg }}
        </div>
        <div v-if="isEmpty" class="status-msg">로깅된 기사가 없습니다.</div>

        <div v-else style="display: flex; flex-direction: column; gap: 0">
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
                  <span class="date">{{
                    a.publishedAt ? formatDate(a.publishedAt) : ""
                  }}</span>
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
              class="load-more-btn"
              @click="loadMore"
              :disabled="loadingMore || !hasMore"
            >
              {{
                loadingMore
                  ? "불러오는 중..."
                  : hasMore
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import MyApi from "../../api/MyApi";
import LogApi from "../../api/LogApi";

const LIMIT = 15;

const articles = ref([]);
const page = ref(0);

const loading = ref(false);
const loadingMore = ref(false);
const errorMsg = ref("");

const hasMore = ref(true);

const isEmpty = computed(() => {
  return (
    !loading.value &&
    !errorMsg.value &&
    articles.value.length === 0 &&
    !hasMore.value
  );
});

// JTBC 예외 처리
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
  articles.value = [];
  page.value = 0;
  errorMsg.value = "";
  hasMore.value = true;
};

const fetchPage = async ({ nextPage, append }) => {
  const data = await MyApi.getMyArticles(nextPage, LIMIT);
  const list = Array.isArray(data) ? data : [];

  if (!append) articles.value = list;
  else articles.value = [...articles.value, ...list];

  hasMore.value = list.length === LIMIT;
  page.value = nextPage;
};

const loadInitial = async () => {
  loading.value = true;
  errorMsg.value = "";
  reset();

  try {
    await fetchPage({ nextPage: 0, append: false });
    if (articles.value.length === 0) {
      hasMore.value = false;
    }
  } catch (e) {
    console.log(e);
    errorMsg.value = "추천 기사를 불러오는 중 오류가 발생했습니다.";
  } finally {
    loading.value = false;
  }
};

const loadMore = async () => {
  if (loading.value || loadingMore.value) return;
  if (!hasMore.value) return;

  loadingMore.value = true;
  errorMsg.value = "";

  try {
    const nextPage = page.value + 1;
    await fetchPage({ nextPage, append: true });
  } catch (e) {
    console.log(e);
    errorMsg.value = "추가 로딩 중 오류가 발생했습니다.";
  } finally {
    loadingMore.value = false;
  }
};

const reload = async () => {
  await loadInitial();
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

onMounted(async () => {
  await loadInitial();
});

onBeforeUnmount(() => {
  detachKeyListener();
  if (modalOpen.value) unlockBodyScroll();
});
</script>

<style scoped>
/* ✅ 1. 전체 페이지 레이아웃 (뷰포트 고정) */
.page-container {
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* ✅ 2. 다크 글래스 패널 (카드 배경) */
.glass-panel {
  width: 100%;
  height: 100%;
  max-width: 100%; /* 화면 꽉 차게 */
  margin: 0 auto;

  /* 투명한 어두운 배경 + 블러 (메인 페이지와 동일) */
  background-color: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  border: 1px solid rgba(255, 255, 255, 0.1);

  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);

  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ✅ 3. 헤더 영역 */
.panel-header {
  padding: 12px 20px;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.desktop-label {
  display: block; /* 기본적으로 보임 */
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

/* 초기화 같은 텍스트 버튼 스타일 */
.action-btn {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #ccc;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

/* 새로고침 아이콘 버튼 */
.refresh-icon-btn {
  border: none;
  background: transparent;
  padding: 8px;
  border-radius: 50%;
  color: #888;
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
}

/* 페이지 표시 텍스트 */
.page-indicator {
  font-size: 13px;
  color: #888;
  margin-right: 12px;
}

/* ✅ 4. 본문 영역 (스크롤) */
.panel-body {
  flex: 1;
  overflow-y: auto; /* 내부 스크롤 */
  padding: 0 20px 20px 20px;
}

/* 스크롤바 디자인 (다크) */
.panel-body::-webkit-scrollbar {
  width: 6px;
}
.panel-body::-webkit-scrollbar-track {
  background: transparent;
}
.panel-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* 로딩/에러 메시지 */
.status-msg {
  padding: 24px 0;
  text-align: center;
  color: #999;
}
.status-msg.error {
  color: #ff6b6b;
}

/* ✅ 5. 기사 아이템 스타일 (다크) */
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

/* 더 불러오기 버튼 */
.load-more-area {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}
.load-more-btn {
  border: none;
  background: rgba(255, 255, 255, 0.1);
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

/* 모달 스타일 (내부는 흰색 유지) */
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

@media (max-width: 640px) {
  .page-container {
    padding: 12px;
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
