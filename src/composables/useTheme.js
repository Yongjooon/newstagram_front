// src/composables/useTheme.js
import { ref } from "vue";

// 전역 상태로 관리 (어디서든 현재 테마를 알 수 있게)
const theme = ref("dark");

export function useTheme() {
  // 1. 테마 적용 함수 (HTML 태그에 속성 부여)
  const applyTheme = () => {
    document.documentElement.setAttribute("data-theme", theme.value);
    localStorage.setItem("user-theme", theme.value); // 브라우저 저장
  };

  // 2. 토글 함수 (버튼 클릭 시 실행)
  const toggleTheme = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
    applyTheme();
  };

  // 3. 초기화 함수 (앱 시작 시 실행)
  const initTheme = () => {
    const savedTheme = localStorage.getItem("user-theme");
    if (savedTheme) {
      theme.value = savedTheme;
    } else {
      // 저장된 게 없으면 시스템 설정 확인
      const userPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      theme.value = userPrefersDark ? "dark" : "light";
    }
    applyTheme();
  };

  return { theme, toggleTheme, initTheme };
}
