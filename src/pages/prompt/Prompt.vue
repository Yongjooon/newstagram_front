<!-- src/pages/prompt/Prompt.vue -->
<template>
  <main style="display:flex; gap:16px; padding:16px;">
    <!-- 좌측: 검색 기록 -->
    <aside style="width:280px; border:1px solid #ddd; border-radius:8px; padding:12px;">
      <h2 style="margin:0 0 12px;">검색 기록</h2>

      <div style="display:flex; gap:8px; margin-bottom:12px;">
        <button type="button" @click="reloadHistory" :disabled="loadingHistory">
          새로고침
        </button>
        <button type="button" @click="clearSelected" :disabled="loadingSearch || loadingMore">
          선택 해제
        </button>
      </div>

      <div style="max-height:520px; overflow:auto; border-top:1px solid #eee; padding-top:8px;">
        <div v-if="loadingHistory" style="padding:8px 0;">불러오는 중...</div>

        <div v-else-if="!historyList.length" style="padding:8px 0; color:#666;">
          검색 기록이 없습니다.
        </div>

        <ul v-else style="list-style:none; padding:0; margin:0;">
          <li v-for="item in historyList" :key="item.id" style="margin-bottom:8px;">
            <button
              type="button"
              @click="onClickHistory(item)"
              :style="historyButtonStyle(item)"
              :disabled="loadingSearch || loadingMore"
              title="클릭하면 해당 검색어로 다시 검색합니다."
            >
              {{ item.query }}
            </button>
          </li>
        </ul>
      </div>
    </aside>

    <!-- 우측: 프롬프트 작성 + 기사 리스트 -->
    <section style="flex:1; border:1px solid #ddd; border-radius:8px; padding:12px;">
      <h1 style="margin:0 0 12px;">Prompt</h1>

      <!-- 프롬프트 작성 컴포넌트 -->
      <WritePrompt @submit="handleSubmit" />

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
import { ref, onMounted } from 'vue';
import WritePrompt from '@/components/WritePrompt.vue';
import PromptApi from '@/api/PromptApi.js';
import LogApi from '@/api/LogApi.js';

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

const reloadHistory = async () => {
  loadingHistory.value = true;
  try {
    const data = await PromptApi.getPromptList();
    historyList.value = Array.isArray(data) ? data : [];
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

const clearSelected = () => {
  selectedHistoryId.value = null;
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

const handleSubmit = async (promptText) => {
  selectedHistoryId.value = null;
  await runSearch(promptText);
};

const onClickHistory = async (item) => {
  if (!item || !item.query) return;
  selectedHistoryId.value = item.id ?? null;
  await runSearch(item.query);
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
  // 1) 클릭 로그 전송 (실패해도 기사 오픈은 진행)
  try {
    if (a?.id !== undefined && a?.id !== null) {
      await LogApi.addLog(a.id);
    }
  } catch (e) {
    console.log(e);
  }

  // 2) 기사 오픈
  if (!a?.url) return;
  window.open(a.url, '_blank', 'noopener,noreferrer');
};

const historyButtonStyle = (item) => {
  const isActive = (item?.id ?? null) === selectedHistoryId.value;
  return {
    width: '100%',
    textAlign: 'left',
    padding: '10px 10px',
    borderRadius: '8px',
    border: '1px solid ' + (isActive ? '#333' : '#ddd'),
    background: isActive ? '#f3f3f3' : '#fff',
    cursor: 'pointer',
  };
};

onMounted(async () => {
  await reloadHistory();
});
</script>

<style scoped></style>
