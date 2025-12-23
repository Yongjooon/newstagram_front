<template>
  <div class="page">
    <div class="card card--padded">
      <div class="page-head">
        <h1 class="page-title">관심사 설정</h1>
      </div>
      <p class="survey-description">
        회원님께 꼭 맞는 뉴스를 추천해 드리기 위해, 관심 있는 분야를 선택해
        주세요.<br />
        이 정보는 초기 맞춤형 뉴스 피드를 구성하는 데 사용됩니다.
      </p>

      <div v-if="loading" class="loading-container">
        <p>관심사 목록을 불러오는 중입니다...</p>
      </div>

      <div v-if="error" class="error-container">
        <p>{{ error }}</p>
      </div>

      <div v-if="!loading && !error" class="category-grid">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-button"
          :class="{ 'category-button--selected': isSelected(category.id) }"
          @click="toggleCategory(category.id)"
        >
          {{ category.description }}
        </button>
      </div>

      <div class="actions">
        <button
          class="btn-primary"
          :disabled="selectedCategoryIds.length === 0 || submitting"
          @click="submitSurvey"
        >
          <span v-if="submitting">제출 중...</span>
          <span v-else>설정 완료</span>
        </button>
      </div>
    </div>
  </div>
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
        response.message || "카테고리 목록을 불러오는 데 실패했습니다.",
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
      selectedCategoryIds.value,
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
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
}

.card {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card--padded {
  padding: 2rem;
}

.page-head {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
}

.survey-description {
  text-align: center;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.error-container {
  color: #ef4444;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.category-button {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #ffffff;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: center;
}

.category-button:hover {
  background-color: #f9fafb;
  border-color: #6b7280;
}

.category-button--selected {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.category-button--selected:hover {
  background-color: #2563eb;
}

.actions {
  display: flex;
  justify-content: center;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #3b82f6;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-primary:not(:disabled):hover {
  background-color: #2563eb;
}
</style>
