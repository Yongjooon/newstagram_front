import { defineStore } from "pinia";
import { ref } from "vue";
import PromptApi from "../api/PromptApi";

const STORAGE_KEY = "prompt.searchHistory";

export const usePromptStore = defineStore("prompt", () => {
  // ✅ Navi 표시용 문자열 배열 (기존 유지)
  const searchHistory = ref([]);

  // ✅ 삭제를 위해 원본도 보관 (id 포함)
  const historyRaw = ref([]); // [{ id, query }, ...]

  const loadingHistory = ref(false);

  function setHistory(list) {
    searchHistory.value = Array.isArray(list) ? list : [];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory.value));
    } catch (e) {
      // ignore storage errors
    }
  }

  function setRaw(list) {
    historyRaw.value = Array.isArray(list) ? list : [];
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
    historyRaw.value = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  async function loadHistory({ force = false } = {}) {
    if (loadingHistory.value) return;
    if (
      !force &&
      Array.isArray(searchHistory.value) &&
      searchHistory.value.length > 0
    )
      return;

    loadingHistory.value = true;

    if (!force && (!searchHistory.value || searchHistory.value.length === 0)) {
      restoreHistory();
    }

    try {
      const res = await PromptApi.getPromptList();

      const raw = res?.data?.data ?? res?.data ?? res ?? [];
      const arr = Array.isArray(raw) ? raw : [];

      // ✅ 원본 저장 (id/query)
      // 서버 필드명이 id / historyId 등 다를 수 있으니 방어적으로 처리
      const normalizedRaw = arr
        .map((x) => {
          if (!x || typeof x !== "object") return null;
          const id = x.id ?? x.historyId ?? x.history_id ?? x.historyID;
          const query = x.query ?? x.keyword ?? x.q ?? "";
          if (id === undefined || id === null) return null;
          return { id, query: String(query).trim() };
        })
        .filter(Boolean);

      setRaw(normalizedRaw);

      // ✅ Navi 표시용 문자열
      const queries = normalizedRaw.map((x) => x.query).filter(Boolean);

      setHistory(queries);
    } catch (e) {
      // 실패 시 캐시만 유지
    } finally {
      loadingHistory.value = false;
    }
  }

  /**
   * ✅ 검색 기록 삭제 (store 단에서 처리)
   */
  async function deleteHistoryById(historyId) {
    if (historyId === undefined || historyId === null) return;

    await PromptApi.deletePrompt(historyId);

    // 성공하면 로컬 상태에서 제거
    const nextRaw = (historyRaw.value || []).filter((x) => x.id !== historyId);
    setRaw(nextRaw);

    const nextQueries = nextRaw.map((x) => x.query).filter(Boolean);
    setHistory(nextQueries);
  }

  return {
    searchHistory,
    historyRaw,
    loadingHistory,
    loadHistory,
    setHistory,
    setRaw,
    restoreHistory,
    clearHistory,
    deleteHistoryById,
  };
});
