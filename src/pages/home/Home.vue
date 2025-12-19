<!-- src/pages/home/Home.vue -->
<template>
  <main style="padding:16px;">
    <h1 style="margin:0 0 12px;">Home</h1>

    <section style="display:flex; gap:8px; margin-bottom:12px;">
      <button type="button" :style="tabStyle('REALTIME')" @click="changePeriod('REALTIME')" :disabled="loading">
        실시간 이슈
      </button>
      <button type="button" :style="tabStyle('DAILY')" @click="changePeriod('DAILY')" :disabled="loading">
        일간 이슈
      </button>
      <button type="button" :style="tabStyle('WEEKLY')" @click="changePeriod('WEEKLY')" :disabled="loading">
        주간 이슈
      </button>

      <div style="flex:1;"></div>

      <button type="button" @click="reload" :disabled="loading">
        새로고침
      </button>
    </section>

    <div v-if="loading" style="padding:12px 0;">불러오는 중...</div>
    <div v-else-if="errorMsg" style="padding:12px 0; color:#c00;">{{ errorMsg }}</div>

    <section v-if="!loading">
      <div v-if="!groups.length" style="color:#666;">
        표시할 이슈가 없습니다.
      </div>

      <div v-else style="display:flex; flex-direction:column; gap:12px;">
        <button
          v-for="g in groups"
          :key="groupKey(g)"
          type="button"
          @click="openArticle(g.article)"
          style="
            text-align:left;
            border:1px solid #eee;
            border-radius:10px;
            padding:12px;
            background:#fff;
            cursor:pointer;
          "
          :title="g.article?.url ? '클릭하면 기사 링크를 엽니다.' : ''"
        >
          <div style="display:flex; gap:12px;">
            <div style="width:120px; flex:0 0 120px;">
              <img
                v-if="g.article?.thumbnailUrl"
                :src="g.article.thumbnailUrl"
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
                  Group #{{ g.groupId }} · Rank {{ g.rankInGroup }}
                </div>
                <div style="font-size:12px; color:#666;">
                  {{ g.article?.publishedAt ? formatDate(g.article.publishedAt) : '' }}
                </div>
              </div>

              <h3 style="margin:6px 0 8px; font-size:16px;">
                {{ g.article?.title }}
              </h3>

              <div style="font-size:12px; color:#666; margin-bottom:8px;">
                <span v-if="g.article?.author">by {{ g.article.author }}</span>
                <span v-if="g.article?.author && g.article?.url"> · </span>
                <span v-if="g.article?.url">{{ g.article.url }}</span>
              </div>

              <p style="margin:0; color:#333; line-height:1.4;">
                {{ g.article?.description || g.article?.content }}
              </p>
            </div>
          </div>
        </button>

        <div style="margin-top:16px; display:flex; justify-content:center; gap:8px;">
          <button type="button" @click="loadMore" :disabled="loadingMore || !hasNext">
            {{ loadingMore ? '불러오는 중...' : (hasNext ? '더 불러오기' : '마지막입니다') }}
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import HomeApi from '@/api/HomeApi.js';
import LogApi from '@/api/LogApi.js';

const periodType = ref('REALTIME');
const cursor = ref(0);

const groups = ref([]);

const hasNext = ref(false);
const nextCursor = ref(0);

const loading = ref(false);
const loadingMore = ref(false);
const errorMsg = ref('');

const tabStyle = (type) => {
  const active = periodType.value === type;
  return {
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid ' + (active ? '#333' : '#ddd'),
    background: active ? '#f3f3f3' : '#fff',
    cursor: 'pointer',
  };
};

const groupKey = (g) => {
  return `${g.groupId}-${g.rankInGroup}-${g.article?.id ?? 'na'}`;
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
  groups.value = [];
  cursor.value = 0;
  hasNext.value = false;
  nextCursor.value = 0;
  errorMsg.value = '';
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
  errorMsg.value = '';
  try {
    cursor.value = 0;
    await fetchPage({ type: periodType.value, cur: cursor.value, append: false });

    if (hasNext.value) cursor.value = nextCursor.value;
  } catch (e) {
    console.log(e);
    errorMsg.value = '이슈를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

const changePeriod = async (type) => {
  if (periodType.value === type) return;
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
  errorMsg.value = '';

  try {
    await fetchPage({ type: periodType.value, cur: cursor.value, append: true });

    if (hasNext.value) cursor.value = nextCursor.value;
  } catch (e) {
    console.log(e);
    errorMsg.value = '추가 로딩 중 오류가 발생했습니다.';
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

  if (!article?.url) return;
  window.open(article.url, '_blank', 'noopener,noreferrer');
};

onMounted(async () => {
  await loadInitial();
});
</script>

<style scoped>
  /* 페이지 베이스 */
main {
  padding: 16px;
}

/* 상단 타이틀 */
h1 {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text);
}

/* 상단 컨트롤 바(버튼 줄) */
section[style*="display:flex"][style*="margin-bottom:12px"] {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 10px;
  box-shadow: var(--shadow);
}

/* 상태 박스(현재 타입/cursor) */
div[style*="justify-content:space-between"][style*="margin-bottom:12px"] {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 12px;
  box-shadow: var(--shadow);
}

/* 로딩/에러 텍스트 */
div[style*="불러오는 중"] {
  color: var(--muted);
}
div[style*="color:#c00"] {
  color: #b91c1c !important;
}

/* 이슈 리스트 컨테이너 */
div[style*="flex-direction:column"][style*="gap:12px"] {
  margin-top: 8px;
}

/* 카드 버튼(이슈 아이템) */
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

/* 썸네일 영역 */
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

/* 하단 더 불러오기 영역 */
div[style*="justify-content:center"][style*="gap:8px"] {
  margin-top: 14px !important;
}

/* 버튼 공통(이 파일 안에서) */
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

</style>
