<template>
  <main class="page-container">
    <section class="feed-card-layout">
      <div class="feed-body glass-panel-body">
        <div class="login-content-wrapper">
          <div class="card-head">
            <h1 class="title">Welcome Back!</h1>
            <p class="subtitle">
              {{ theme === "dark" ? "Newstagram" : "Newsreads" }}에 오신 것을
              환영합니다.
            </p>
          </div>

          <form class="login-form" @submit.prevent="login">
            <div class="input-group">
              <label class="input-label">이메일</label>
              <input
                v-model="loginUser.email"
                type="email"
                placeholder="example@email.com"
                class="input-dark"
                autocomplete="email"
              />
            </div>

            <div class="input-group">
              <label class="input-label">비밀번호</label>
              <div class="password-wrapper">
                <input
                  v-model="loginUser.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="비밀번호 입력"
                  class="input-dark"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="toggle-pwd-btn"
                  @click="togglePassword"
                  tabindex="-1"
                >
                  <svg
                    v-if="showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    ></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    ></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-helper">
              <button type="button" class="helper-text" @click="goFindId">
                이메일 찾기
              </button>
              <span class="divider-dot">·</span>
              <button type="button" class="helper-text" @click="goFindPwd">
                비밀번호 재설정
              </button>
            </div>

            <button class="btn-glass primary full-width" type="submit">
              로그인
            </button>

            <div class="divider">
              <span class="divider-line"></span>
              <span class="divider-text">또는</span>
              <span class="divider-line"></span>
            </div>

            <div class="social-buttons">
              <a
                :href="`${baseUrl}/api/oauth2/authorization/google`"
                class="btn-glass google-btn full-width"
                target="_self"
              >
                <img
                  src="/src/assets/google_logo.svg"
                  alt="Google"
                  width="20"
                />
                <span class="social-text">Google 계정으로 로그인</span>
              </a>
            </div>

            <div class="card-footer">
              <span>계정이 없으신가요? </span>
              <button type="button" class="link-btn" @click="goSignup">
                회원가입
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/user";

const baseUrl = import.meta.env.VITE_API_URL;

const router = useRouter();
const userStore = useUserStore();

// Password Toggle State
const showPassword = ref(false);

const loginUser = reactive({
  email: "",
  password: "",
});

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const login = async () => {
  try {
    const res = await userStore.login(loginUser);
    router.push({ name: "home" });
  } catch (error) {
    alert(error?.message || "로그인에 실패했습니다.");
  }
};

function goSignup() {
  router.push({ name: "Signup" });
}
function goFindId() {
  router.push({ name: "FindID" });
}
function goFindPwd() {
  router.push({ name: "FindPwd" });
}
</script>

<style scoped>
/* ✅ 레이아웃 */
.page-container {
  height: calc(100vh - 56px); /* 전체 화면 높이 사용 */
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
  padding-top: 10px;
}

.feed-card-layout {
  width: 100%;
  height: 100%;
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: visible;
}

/* ✅ 헤더 (폴더 탭) - 변수 적용 */
.feed-header {
  display: flex;
  align-items: flex-end;
  height: 50px;
  flex-shrink: 0;
  position: relative;
  z-index: 5;
}

.folder-tab {
  background-color: var(--bg-panel); /* 변수 사용 */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass); /* 변수 사용 */
  border-bottom: none;
  border-radius: 16px 16px 0 0;

  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 100%;
  min-width: 160px;
  position: relative;
  top: 1px;
}

.desktop-label {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary); /* 변수 사용 */
  margin: 0;
  letter-spacing: -0.02em;
}

/* ✅ 본문 (유리 패널) - 변수 적용 */
.feed-body.glass-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 40px;

  background-color: var(--bg-panel); /* 변수 사용 */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass); /* 변수 사용 */
  border-radius: 24px;
  box-shadow: var(--shadow-panel); /* 변수 사용 */
  z-index: 4;
}

/* 스크롤바 */
.feed-body::-webkit-scrollbar {
  width: 6px;
}
.feed-body::-webkit-scrollbar-track {
  background: transparent;
}
.feed-body::-webkit-scrollbar-thumb {
  background: var(--border-glass);
  border-radius: 3px;
}

/* ✅ 콘텐츠 */
.login-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
}

.card-head {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 900;
  color: var(--text-primary); /* 변수 사용 */
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 15px;
  color: var(--text-secondary); /* 변수 사용 */
  margin: 0;
}

/* 폼 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  color: var(--text-primary); /* 변수 사용 */
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* 입력 필드 */
.input-dark {
  width: 100%;
  background: var(--bg-input); /* 변수 사용 */
  border: 1px solid var(--border-glass); /* 변수 사용 */
  color: var(--text-primary); /* 변수 사용 */
  padding: 14px 16px;
  border-radius: 12px;
  outline: none;
  font-size: 15px;
  transition: all 0.2s;
}

.input-dark:focus {
  border-color: var(--accent-color); /* 변수 사용 */
  background: var(--bg-input); /* 라이트 모드 등에서 포커스 시 배경 유지 */
  box-shadow: 0 0 0 2px rgba(114, 214, 245, 0.1);
}

.toggle-pwd-btn {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: var(--text-secondary); /* 변수 사용 */
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.toggle-pwd-btn:hover {
  color: var(--text-primary);
}

/* 유틸리티 링크 */
.form-helper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: -8px;
}

.helper-text {
  background: transparent;
  border: none;
  color: var(--text-secondary); /* 변수 사용 */
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}
.helper-text:hover {
  color: var(--text-primary);
  text-decoration: underline;
}

.divider-dot {
  color: var(--text-secondary);
}

/* 버튼 */
.btn-glass {
  background: var(--bg-button-glass); /* 변수 사용 */
  border: 1px solid var(--border-glass); /* 변수 사용 */
  color: var(--text-primary);
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

.btn-glass:hover {
  background: var(--border-glass);
}

.btn-glass.primary {
  /* 포인트 색상은 고정하거나 변수화 */
  background: rgba(114, 214, 245, 0.15);
  border-color: rgba(114, 214, 245, 0.4);
  color: var(--accent-color);
}

.btn-glass.primary:hover {
  background: rgba(114, 214, 245, 0.3);
  color: #fff; /* 호버 시에는 흰색 고정 (가독성) */
  box-shadow: 0 0 15px rgba(114, 214, 245, 0.2);
}

.full-width {
  width: 100%;
}

/* 구분선 */
.divider {
  display: flex;
  align-items: center;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--divider); /* 변수 사용 */
}

.divider-text {
  padding: 0 12px;
  color: var(--text-secondary);
  font-size: 13px;
}

/* 소셜 버튼 */
.google-btn {
  background: #ffffff; /* 구글 버튼은 흰색 배경 고정 */
  color: #1f2937;
  border: 1px solid #e5e7eb;
  text-decoration: none;
  gap: 10px;
}
.google-btn:hover {
  background: #f9fafb;
}
.social-text {
  font-size: 15px;
  font-weight: 600;
}

/* 하단 링크 */
.card-footer {
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary); /* 변수 사용 */
}

.link-btn {
  background: transparent;
  border: none;
  color: var(--accent-color); /* 변수 사용 */
  font-weight: 700;
  cursor: pointer;
  margin-left: 4px;
  padding: 4px;
}
.link-btn:hover {
  text-decoration: underline;
  color: var(--text-primary);
}

/* 모바일 반응형 */
@media (max-width: 640px) {
  .page-container {
    padding: 12px;
  }

  .feed-body.glass-panel-body {
    padding: 24px;
    border-radius: 0 0 16px 16px;
  }

  .folder-tab {
    min-width: 0;
    width: 100%;
    border-radius: 16px 16px 0 0;
  }
}
</style>
