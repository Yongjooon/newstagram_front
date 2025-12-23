<template>
  <main style="padding: 16px">
    <section style="display: flex; gap: 8px; margin-bottom: 12px">
      <button
        type="button"
        :style="tabStyle('REALTIME')"
        @click="changePeriod('REALTIME')"
        :disabled="loading"
      >
        실시간 이슈
      </button>
      <button
        type="button"
        :style="tabStyle('DAILY')"
        @click="changePeriod('DAILY')"
        :disabled="loading"
      >
        일간 이슈
      </button>
      <button
        type="button"
        :style="tabStyle('WEEKLY')"
        @click="changePeriod('WEEKLY')"
        :disabled="loading"
      >
        주간 이슈
      </button>

      <div style="flex: 1"></div>

      <button type="button" @click="reload" :disabled="loading">
        새로고침
      </button>
    </section>

    <div v-if="loading" style="padding: 12px 0">불러오는 중...</div>
    <div v-else-if="errorMsg" style="padding: 12px 0; color: #c00">
      {{ errorMsg }}
    </div>

    <section v-if="!loading">
      <div v-if="!groups.length" style="color: #666">
        표시할 이슈가 없습니다.
      </div>

      <div v-else style="display: flex; flex-direction: column; gap: 12px">
        <button
          v-for="g in groups"
          :key="groupKey(g)"
          type="button"
          @click="openArticle(g.article)"
          style="
            text-align: left;
            border: 1px solid #eee;
            border-radius: 10px;
            padding: 12px;
            background: #fff;
            cursor: pointer;
            width: 100%;
          "
          :title="
            g.article?.url ? '클릭하면 모달로 기사 원문을 보여줍니다.' : ''
          "
        >
          <div style="display: flex; gap: 12px">
            <div style="width: 120px; flex: 0 0 120px">
              <img
                v-if="g.article?.thumbnailUrl"
                :src="g.article.thumbnailUrl"
                alt="thumbnail"
                style="
                  width: 120px;
                  height: 80px;
                  object-fit: cover;
                  border-radius: 6px;
                  border: 1px solid #eee;
                "
              />
              <div
                v-else
                style="
                  width: 120px;
                  height: 80px;
                  border-radius: 6px;
                  border: 1px solid #eee;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #999;
                "
              >
                No Image
              </div>
            </div>

            <div style="flex: 1; min-width: 0">
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 12px;
                "
              >
                <div style="font-size: 12px; color: #666">
                  {{
                    g.article?.publishedAt
                      ? formatDate(g.article.publishedAt)
                      : ""
                  }}
                </div>
              </div>

              <h3 style="margin: 6px 0 8px; font-size: 16px">
                {{ g.article?.title }}
              </h3>

              <p style="margin: 0; color: #333; line-height: 1.4">
                {{ g.article?.description || g.article?.content }}
              </p>
            </div>
          </div>
        </button>

        <div
          style="
            margin-top: 16px;
            display: flex;
            justify-content: center;
            gap: 8px;
          "
        >
          <button
            type="button"
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

const tabStyle = (type) => {
  const active = periodType.value === type;
  return {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid " + (active ? "#333" : "#ddd"),
    background: active ? "#f3f3f3" : "#fff",
    cursor: "pointer",
  };
};

const groupKey = (g) =>
  `${g.groupId}-${g.rankInGroup}-${g.article?.id ?? "na"}`;

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

  // JTBC만 안내 후 새창
  if (url.startsWith(JTBC_PREFIX)) {
    openInNewWindowWithNotice(url);
    return;
  }

  // 그 외는 무조건 모달
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
  },
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
  transition:
    transform 0.04s ease,
    background 0.12s ease,
    border-color 0.12s ease;
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

.article-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
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
