<!-- src/pages/my/My.vue -->
<template>
  <main style="padding:16px;">
    <h1 style="margin:0 0 12px;">My</h1>

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
          :title="a.url ? '클릭하면 기사 링크를 엽니다.' : ''"
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
                  {{ a.author ? `by ${a.author}` : '' }}
                </div>
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
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MyApi from '@/api/MyApi.js';
import LogApi from '@/api/LogApi.js';

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

  if (!a?.url) return;
  window.open(a.url, '_blank', 'noopener,noreferrer');
};

onMounted(async () => {
  await loadInitial();
});
</script>

<style scoped></style>
