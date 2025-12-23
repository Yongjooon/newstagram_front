<template>
  <div class="search-bar">
    <div class="placeholder-wrapper" v-show="!text && !isFocused">
      <Transition name="slide-down" mode="out-in">
        <span :key="currentPromptIndex" class="placeholder-text">
          {{ currentPrompt }}
        </span>
      </Transition>
    </div>

    <input
      type="text"
      v-model="text"
      class="search-input"
      @keyup.enter="onSubmit"
      @focus="isFocused = true"
      @blur="isFocused = false"
      autocomplete="off"
    />

    <button
      v-if="text"
      type="button"
      class="btn-icon btn-clear"
      @click="onClear"
      aria-label="지우기"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <button
      type="button"
      class="btn-icon btn-submit"
      @click="onSubmit"
      :disabled="!text.trim()"
      aria-label="전송"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const emit = defineEmits(["submit"]);
const text = ref("");
const isFocused = ref(false); // ✅ 포커스 상태 추적 변수

const prompts = [
  "오늘 가장 핫한 뉴스가 뭐야?",
  "삼성전자 최근 주가 흐름 알려줘",
  "이번 주말 서울 날씨 어때?",
  "손흥민 최근 경기 결과 요약해줘",
  "요즘 유행하는 IT 트렌드는?",
];

const currentPromptIndex = ref(0);
let intervalId = null;

const currentPrompt = computed(() => prompts[currentPromptIndex.value]);

const startRotation = () => {
  intervalId = setInterval(() => {
    currentPromptIndex.value = (currentPromptIndex.value + 1) % prompts.length;
  }, 5000);
};

const stopRotation = () => {
  if (intervalId) clearInterval(intervalId);
};

function onSubmit() {
  const value = text.value.trim();
  if (!value) return;
  emit("submit", value);
  text.value = "";
  // 전송 후 키보드 내리려면 아래 주석 해제
  // document.activeElement.blur();
}

function onClear() {
  text.value = "";
  // 지우고 나서 다시 입력하도록 포커스 유지
  // document.querySelector('.search-input').focus();
}

onMounted(() => {
  startRotation();
});

onUnmounted(() => {
  stopRotation();
});
</script>

<style scoped>
/* 검색바 컨테이너 */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 0 4px 0 16px;
  transition: all 0.2s ease;
  overflow: hidden;
}

/* ✅ 포커스 시 효과 제거 (기존 focus-within 스타일 삭제됨) */
/* 만약 미세하게라도 변하는 게 싫다면 아래처럼 고정 */
.search-bar:focus-within {
  border-color: rgba(255, 255, 255, 0.2); /* 기존 색 유지 */
  box-shadow: none; /* 그림자 제거 */
}

/* 입력창 스타일 */
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none !important; /* 기본 아웃라인 제거 */
  color: #ffffff;
  font-size: 14px;
  min-width: 0;
  z-index: 2;
  position: relative;
  box-shadow: none;
}

/* 플레이스홀더 래퍼 */
.placeholder-wrapper {
  position: absolute;
  top: 0;
  left: 16px;
  right: 80px;
  bottom: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.placeholder-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

/* 애니메이션 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 버튼 스타일 */
.btn-icon {
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s;
  z-index: 3;
}

.btn-icon svg {
  width: 20px;
  height: 20px;
}

.btn-clear {
  color: rgba(255, 255, 255, 0.4);
}
.btn-clear:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.btn-submit {
  color: #72d6f5;
  margin-left: 2px;
}
.btn-submit:hover {
  background: rgba(114, 214, 245, 0.2);
  transform: scale(1.1);
}
.btn-submit:disabled {
  color: rgba(255, 255, 255, 0.2);
  cursor: default;
  transform: none;
  background: transparent;
}
</style>
