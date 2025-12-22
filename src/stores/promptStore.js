import { defineStore } from 'pinia';
import { ref } from 'vue';
import PromptApi from '../api/PromptApi';

const STORAGE_KEY = 'prompt.searchHistory';

export const usePromptStore = defineStore('prompt', () => {
  const searchHistory = ref([]);
  const loadingHistory = ref(false);

  function setHistory(list) {
    searchHistory.value = Array.isArray(list) ? list : [];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory.value));
    } catch (e) {
      // ignore storage errors
    }
  }

  function restoreHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) searchHistory.value = parsed;
    } catch (e) {
      // ignore parse errors
    }
  }

  function clearHistory() {
    searchHistory.value = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  /**
   * 서버에서 프롬프트 검색기록을 불러온다.
   * - Navi.vue / App.vue 등 "로그인 직후"에 호출되어 즉시 메뉴에 보이게 한다.
   * - Prompt.vue에서 실제로 잘 동작하는 API(getPromptList)로 통일한다.
   */
  async function loadHistory({ force = false } = {}) {
    if (loadingHistory.value) return;
    if (!force && Array.isArray(searchHistory.value) && searchHistory.value.length > 0) return;

    loadingHistory.value = true;

    // 먼저 로컬 캐시 복구(UX 개선)
    if (!force && (!searchHistory.value || searchHistory.value.length === 0)) {
      restoreHistory();
    }

    try {
      // ✅ 여기 핵심: getSearchHistory 대신 getPromptList 사용
      const res = await PromptApi.getPromptList();

      // res가 axios response일 수도 있고, data를 바로 반환할 수도 있으니 모두 대응
      const raw = res?.data?.data ?? res?.data ?? res ?? [];
      const arr = Array.isArray(raw) ? raw : [];

      // 서버가 [{query:"..."}] 형태면 query만 추출, 이미 문자열 배열이면 그대로 사용
      const queries = arr
        .map((x) => (typeof x === 'string' ? x : (x?.query ?? '')))
        .map((s) => String(s).trim())
        .filter(Boolean);

      setHistory(queries);
    } catch (e) {
      // 서버 호출 실패 시: 캐시만 유지
      // console.error(e);
    } finally {
      loadingHistory.value = false;
    }
  }

  return {
    searchHistory,
    loadingHistory,
    loadHistory,
    setHistory,
    restoreHistory,
    clearHistory,
  };
});
