<!-- src/pages/prompt/Prompt.vue -->
<template>
  <main style="display:flex; gap:16px; padding:16px;">
    <!-- 우측: 기사 리스트 -->
    <section style="flex:1; border:1px solid #ddd; border-radius:8px; padding:12px;">
      <h1 style="margin:0 0 12px;">Prompt</h1>

      <hr style="margin:16px 0;" />

      <!-- 현재 검색 상태 -->
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px;">
        <div>
          <div style="font-size:14px; color:#666;">현재 검색어</div>
          <div style="font-size:16px; font-weight:600;">
            {{ currentQuery ? currentQuery : '-' }}
          </div>
        </div>

        <div style="display:flex; gap:8px;">
          <button type="button" @click="retrySearch" :disabled="!currentQuery || loadingSearch || loadingMore">
            다시 검색
          </button>
          <button type="button" @click="resetArticles" :disabled="loadingSearch || loadingMore">
            결과 초기화
          </button>
        </div>
      </div>

      <!-- 로딩/에러 -->
      <div v-if="loadingSearch" style="padding:12px 0;">검색 중...</div>
      <div v-else-if="errorMsg" style="padding:12px 0; color:#c00;">
        {{ errorMsg }}
      </div>

      <!-- 기사 목록 -->
      <div v-if="!loadingSearch" style="display:flex; flex-direction:column; gap:12px;">
        <div v-if="!articles.length" style="color:#666;">
          검색 결과가 없습니다.
        </div>

        <div v-else>
          <!-- 버튼 카드 리스트 -->
          <div style="display:flex; flex-direction:column; gap:12px;">
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
              :title="a.url ? '클릭하면 기사 링크를 엽니다.' : ''"
            >
              <div style="display:flex; gap:12px;">
                <!-- 썸네일 -->
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

                <!-- 본문 -->
                <div style="flex:1;">
                  <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
                    <div style="font-size:12px; color:#666;">
                      <span v-if="a.author">by {{ a.author }}</span>
                    </div>
                    <div style="font-size:12px; color:#666;">
                      <span v-if="a.publishedAt">{{ formatDate(a.publishedAt) }}</span>
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
          </div>

          <!-- 더 보기 -->
          <div style="margin-top:16px; display:flex; justify-content:center;">
            <button type="button" @click="loadMore" :disabled="loadingMore || !hasMore">
              {{ loadingMore ? '불러오는 중...' : (hasMore ? '더 보기' : '더 이상 결과 없음') }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import PromptApi from '../../api/PromptApi';
import LogApi from '../../api/LogApi';
import { usePromptStore } from '../../stores/promptStore';

const route = useRoute();
const promptStore = usePromptStore();

const LIMIT = 15;

const historyList = ref([]);
const loadingHistory = ref(false);

const currentQuery = ref('');
const selectedHistoryId = ref(null);

const articles = ref([]);
const page = ref(0);
const hasMore = ref(false);

const loadingSearch = ref(false);
const loadingMore = ref(false);
const errorMsg = ref('');

const syncStoreHistoryFromApi = () => {
  const queries = (historyList.value || [])
    .map((x) => (x?.query || '').trim())
    .filter(Boolean);

  promptStore.searchHistory = queries;
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
  errorMsg.value = '';
};

const fetchArticles = async ({ query, nextPage, append }) => {
  errorMsg.value = '';

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
  const q = (query || '').trim();
  if (!q) return;

  loadingSearch.value = true;
  resetArticles();

  try {
    currentQuery.value = q;

    if (typeof promptStore.addSearch === 'function') {
      promptStore.addSearch(q);
    }

    await fetchArticles({ query: q, nextPage: 0, append: false });
    await reloadHistory();
  } catch (e) {
    console.log(e);
    errorMsg.value = '검색 중 오류가 발생했습니다.';
  } finally {
    loadingSearch.value = false;
  }
};

const loadMore = async () => {
  if (!currentQuery.value || loadingSearch.value || loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  try {
    const nextPage = page.value + 1;
    await fetchArticles({ query: currentQuery.value, nextPage, append: true });
  } catch (e) {
    console.log(e);
    errorMsg.value = '추가 로딩 중 오류가 발생했습니다.';
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

  if (!a?.url) return;
  window.open(a.url, '_blank', 'noopener,noreferrer');
};

// ✅ /prompt?q=... 로 들어오면 즉시 검색
watch(
  () => route.query.q,
  async (q) => {
    const keyword = (q || '').toString().trim();
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
</script>

<style scoped>
main {
  display: flex;
  gap: 16px;
  padding: 16px;
}

section[style*="flex:1"][style*="border:1px solid #ddd"] {
  background: var(--panel);
  border: 1px solid var(--line) !important;
  border-radius: var(--radius) !important;
  box-shadow: var(--shadow);
}

/* 제목 */
h1 {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text);
}

/* 기사 카드 버튼 */
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

/* 본문 */
p {
  color: #374151 !important;
}

/* 공통 버튼 */
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

/* 에러 */
div[style*="color:#c00"] {
  color: #b91c1c !important;
}

/* 반응형 */
@media (max-width: 900px) {
  main {
    flex-direction: column;
  }
}
</style>
