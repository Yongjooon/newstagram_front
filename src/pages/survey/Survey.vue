<template>
  <main class="page-container">
    <section class="feed-card-layout">
      <header class="feed-header">
        <div class="folder-tab">
          <h2 class="desktop-label">🎯 관심사 설정</h2>
        </div>
      </header>

      <div class="feed-body glass-panel-body">
        <div class="content-wrapper">
          <div class="text-head">
            <p class="survey-description">
              회원님께 꼭 맞는 뉴스를 추천해 드리기 위해,<br />
              <strong>관심 있는 분야</strong>를 모두 선택해 주세요.
            </p>
          </div>

          <div v-if="loading" class="status-box">
            <p>관심사 목록을 불러오는 중입니다...</p>
          </div>

          <div v-if="error" class="status-box error">
            <p>{{ error }}</p>
          </div>

          <div v-if="!loading && !error" class="category-grid">
            <button
              v-for="category in categories"
              :key="category.id"
              class="category-btn"
              :class="{ selected: isSelected(category.id) }"
              @click="toggleCategory(category.id)"
            >
              <span v-if="isSelected(category.id)" class="check-icon">✓</span>
              {{ category.description }}
            </button>
          </div>

          <div class="actions">
            <button
              class="btn-glass primary full-width"
              :disabled="selectedCategoryIds.length === 0 || submitting"
              @click="submitSurvey"
            >
              <span v-if="submitting">제출 중...</span>
              <span v-else>설정 완료</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import SurveyApi from "../../api/SurveyApi";

const router = useRouter();

const categories = ref([]);
const selectedCategoryIds = ref([]);
const loading = ref(true);
const submitting = ref(false);
const error = ref(null);

const fetchCategories = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await SurveyApi.getCategories();
    if (response.success) {
      categories.value = response.data;
    } else {
      throw new Error(
        response.message || "카테고리 목록을 불러오는 데 실패했습니다."
      );
    }
  } catch (err) {
    error.value = err.message || "오류가 발생했습니다. 다시 시도해 주세요.";
  } finally {
    loading.value = false;
  }
};

const toggleCategory = (id) => {
  const index = selectedCategoryIds.value.indexOf(id);
  if (index > -1) {
    selectedCategoryIds.value.splice(index, 1);
  } else {
    selectedCategoryIds.value.push(id);
  }
};

const isSelected = (id) => {
  return selectedCategoryIds.value.includes(id);
};

const submitSurvey = async () => {
  if (selectedCategoryIds.value.length === 0) {
    alert("최소 하나 이상의 관심사를 선택해야 합니다.");
    return;
  }

  try {
    submitting.value = true;
    error.value = null;
    const response = await SurveyApi.submitCategories(
      selectedCategoryIds.value
    );
    if (response.success) {
      alert("관심사 설정이 완료되었습니다.");
      router.push({ name: "home" });
    } else {
      throw new Error(response.message || "관심사 설정에 실패했습니다.");
    }
  } catch (err) {
    error.value = err.message || "오류가 발생했습니다. 다시 시도해 주세요.";
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchCategories();
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
  max-width: 720px; /* 카테고리 그리드를 위해 조금 넓게 */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: visible;
}

/* ✅ 헤더 (폴더 탭) */
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
}

/* ✅ 본문 (유리 패널) */
.feed-body.glass-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 40px;

  background-color: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 24px 24px 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  z-index: 4;
}

/* ✅ 콘텐츠 내부 */
.content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.text-head {
  text-align: center;
  margin-bottom: 32px;
}

.survey-description {
  color: #d1d5db; /* 밝은 회색 */
  line-height: 1.6;
  font-size: 15px;
}

.survey-description strong {
  color: #fff;
  color: #72d6f5; /* 강조색 */
}

/* 상태 박스 (로딩/에러) */
.status-box {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}
.status-box.error {
  color: #f87171;
  border: 1px dashed rgba(248, 113, 113, 0.3);
}

/* ✅ 카테고리 그리드 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(140px, 1fr)
  ); /* 반응형 그리드 */
  gap: 12px;
  margin-bottom: 40px;
  flex: 1; /* 남은 공간 차지 */
}

/* 카테고리 버튼 (유리 스타일) */
.category-btn {
  position: relative;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  color: #e5e7eb;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60px;
}

.category-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 선택된 상태 */
.category-btn.selected {
  background-color: rgba(114, 214, 245, 0.15);
  border-color: #72d6f5;
  color: #fff;
  box-shadow: 0 0 15px rgba(114, 214, 245, 0.2);
}

.check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 12px;
  color: #72d6f5;
  font-weight: 900;
}

/* 하단 액션 버튼 영역 */
.actions {
  display: flex;
  justify-content: center;
  margin-top: auto; /* 바닥에 붙임 */
}

/* 버튼 스타일 */
.btn-glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.2s;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-glass.primary {
  background: rgba(114, 214, 245, 0.15);
  border-color: rgba(114, 214, 245, 0.4);
  color: #72d6f5;
}

.btn-glass.primary:hover:not(:disabled) {
  background: rgba(114, 214, 245, 0.3);
  color: #fff;
  box-shadow: 0 0 15px rgba(114, 214, 245, 0.2);
}

.btn-glass:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.1);
  color: #6b7280;
}

.full-width {
  width: 100%;
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

/* 모바일 반응형 */
@media (max-width: 640px) {
  .page-container {
    padding: 12px;
  }

  .feed-body.glass-panel-body {
    padding: 24px 16px;
    border-radius: 0 0 16px 16px;
  }

  .folder-tab {
    min-width: 0;
    width: 100%;
    border-radius: 16px 16px 0 0;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr); /* 모바일은 2열 */
  }
}
</style>
