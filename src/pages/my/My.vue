<template>
  <main style="padding:16px;">
    <section style="display:flex; gap:8px; margin-bottom:12px;">
      <button type="button" @click="reload" :disabled="loading || loadingMore">
        새로고침
      </button>
      <button type="button" @click="reset" :disabled="loading || loadingMore">
        초기화
      </button>
      <div style="flex:1;"></div>
      <div style="font-size:12px; color:#666; align-self:center;">
        page: {{ page }}
      </div>
    </section>

    <div v-if="loading" style="padding:12px 0;">불러오는 중...</div>
    <div v-else-if="errorMsg" style="padding:12px 0; color:#c00;">{{ errorMsg }}</div>

    <section v-if="!loading">
      <div v-if="isEmpty" style="padding:12px 0; color:#666;">
        로깅된 기사가 없습니다.
      </div>

      <div v-else style="display:flex; flex-direction:column; gap:12px;">
        <button
          v-for="a in articles"
          :key="a.id"
          type="button"
          @click="openArticle(a)"
          style="
            text-align:left;
            border:1px solid #eee;
            border-radius:10px;
            padding:12px;
            background:#fff;
            cursor:pointer;
          "
          :title="a.url ? '클릭하면 모달로 기사 원문을 보여줍니다.' : ''"
        >
          <div style="display:flex; gap:12px;">
            <div style="width:120px; flex:0 0 120px;">
              <img
                v-if="a.thumbnailUrl"
                :src="a.thumbnailUrl"
                alt="thumbnail"
                style="width:120px; height:80px; object-fit:cover; border-radius:6px; border:1px solid #eee;"
              />
              <div
                v-else
                style="width:120px; height:80px; border-radius:6px; border:1px solid #eee; display:flex; align-items:center; justify-content:center; color:#999;"
              >
                No Image
              </div>
            </div>

            <div style="flex:1;">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
                <div style="font-size:12px; color:#666;">
                  {{ a.publishedAt ? formatDate(a.publishedAt) : '' }}
                </div>
              </div>

              <h3 style="margin:6px 0 8px; font-size:16px;">
                {{ a.title }}
              </h3>

              <p style="margin:0; color:#333; line-height:1.4;">
                {{ a.description || a.content }}
              </p>
            </div>
          </div>
        </button>

        <div style="margin-top:16px; display:flex; justify-content:center;">
          <button type="button" @click="loadMore" :disabled="loadingMore || !hasMore">
            {{ loadingMore ? '불러오는 중...' : (hasMore ? '더 불러오기' : '마지막입니다') }}
          </button>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import MyApi from '../../api/MyApi';
import LogApi from '../../api/LogApi';

const LIMIT = 15;

const articles = ref([]);
const page = ref(0);

const loading = ref(false);
const loadingMore = ref(false);
const errorMsg = ref('');

const hasMore = ref(true);

const isEmpty = computed(() => {
  return !loading.value && !errorMsg.value && articles.value.length === 0 && !hasMore.value;
});

// JTBC 예외 처리
const JTBC_PREFIX = 'https://news.jtbc.co.kr/';

const modalOpen = ref(false);
const iframeUrl = ref('');

let __scrollY = 0;

const lockBodyScroll = () => {
  __scrollY = window.scrollY || 0;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${__scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
};

const unlockBodyScroll = () => {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  window.scrollTo(0, __scrollY);
};

const onKeyDown = (e) => {
  if (!modalOpen.value) return;
  if (e.key === 'Escape') closeModal();
};

const attachKeyListener = () => window.addEventListener('keydown', onKeyDown);
const detachKeyListener = () => window.removeEventListener('keydown', onKeyDown);

const openInNewWindowWithNotice = (url) => {
  alert('신문사 제한으로 외부창에서 기사를 띄웁니다.');
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
};

const closeModal = () => {
  modalOpen.value = false;
  iframeUrl.value = '';
  unlockBodyScroll();
  detachKeyListener();
};

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

const reset = () => {
  articles.value = [];
  page.value = 0;
  errorMsg.value = '';
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
  errorMsg.value = '';
  reset();

  try {
    await fetchPage({ nextPage: 0, append: false });
    if (articles.value.length === 0) {
      hasMore.value = false;
    }
  } catch (e) {
    console.log(e);
    errorMsg.value = '추천 기사를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

const loadMore = async () => {
  if (loading.value || loadingMore.value) return;
  if (!hasMore.value) return;

  loadingMore.value = true;
  errorMsg.value = '';

  try {
    const nextPage = page.value + 1;
    await fetchPage({ nextPage, append: true });
  } catch (e) {
    console.log(e);
    errorMsg.value = '추가 로딩 중 오류가 발생했습니다.';
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

  const url = (a?.url || '').trim();
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
main {
  padding: 16px;
}

h1 {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text);
}

/* 상단 컨트롤 */
section[style*="display:flex"][style*="margin-bottom:12px"] {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 10px;
  box-shadow: var(--shadow);
}

/* 에러 색 */
div[style*="color:#c00"] {
  color: #b91c1c !important;
}

/* 리스트 카드 */
button[style*="text-align:left"][style*="border-radius:10px"][style*="padding:12px"] {
  border: 1px solid var(--line) !important;
  border-radius: var(--radius) !important;
  background: var(--panel) !important;
  box-shadow: var(--shadow) !important;
  transition: transform 0.04s ease, background 0.12s ease, border-color 0.12s ease;
}

button[style*="text-align:left"][style*="border-radius:10px"][style*="padding:12px"]:hover {
  background: #fafafa !important;
  border-color: #d1d5db !important;
}

button[style*="text-align:left"][style*="border-radius:10px"][style*="padding:12px"]:active {
  transform: translateY(1px);
}

/* 썸네일 */
img[alt="thumbnail"] {
  border-radius: 12px !important;
  border: 1px solid var(--line) !important;
}

div[style*="No Image"] {
  border-radius: 12px !important;
  border: 1px solid var(--line) !important;
  background: #fafafa !important;
}

/* 제목 */
h3 {
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text);
}

/* 본문 */
p {
  color: #374151 !important;
}

/* 버튼 공통 */
button {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
}

button:hover {
  background: #fafafa;
  border-color: #d1d5db;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.article-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 12px;
}

.article-modal__panel {
  width: min(1200px, 100%);
  height: 90vh;
  background: #fff;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.article-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid #eee;
  font-weight: 700;
}

.article-modal__iframe {
  flex: 1;
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
}

@media (max-width: 640px) {
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
