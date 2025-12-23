<template>
  <main class="page-container">
    <section class="feed-card-layout">
      <div class="feed-body glass-panel-body">
        <div class="login-content-wrapper">
          <div class="card-head">
            <h1 class="title">Welcome Back!</h1>
            <p class="subtitle">Newstagram에 오신 것을 환영합니다.</p>
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
.page-container {
  height: fit-content;
  padding: 16px;
  margin: auto;
  box-sizing: border-box;
}

.feed-card-layout {
  width: 100%;
  height: auto;
  max-width: 520px;
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
  min-width: 160px;
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

.feed-body.glass-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 40px;

  background-color: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  z-index: 4;
}

.login-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center; /* 세로 중앙 정렬 */
}

/* 타이틀 섹션 */
.card-head {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 15px;
  color: #9ca3af;
  margin: 0;
}

/* 폼 스타일 */
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
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* 다크 모드 입력 필드 */
.input-dark {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 14px 16px;
  border-radius: 12px;
  outline: none;
  font-size: 15px;
  transition: all 0.2s;
}

.input-dark:focus {
  border-color: #72d6f5;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 0 2px rgba(114, 214, 245, 0.1);
}

/* 비밀번호 토글 버튼 */
.toggle-pwd-btn {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.toggle-pwd-btn:hover {
  color: #fff;
}

/* 아이디/비번 찾기 링크 */
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
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}
.helper-text:hover {
  color: #fff;
  text-decoration: underline;
}

.divider-dot {
  color: #4b5563;
  font-size: 12px;
}

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
  height: 52px; /* 버튼 높이 키움 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-glass.primary {
  background: rgba(114, 214, 245, 0.15);
  border-color: rgba(114, 214, 245, 0.4);
  color: #72d6f5;
}

.btn-glass.primary:hover {
  background: rgba(114, 214, 245, 0.3);
  color: #fff;
  box-shadow: 0 0 15px rgba(114, 214, 245, 0.2);
}

.full-width {
  width: 100%;
}

.divider {
  display: flex;
  align-items: center;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.divider-text {
  padding: 0 12px;
  color: #6b7280;
  font-size: 13px;
}

/* 소셜 버튼 */
.google-btn {
  background: rgba(255, 255, 255, 0.95);
  color: #1f2937;
  border-color: transparent;
  text-decoration: none;
  gap: 10px;
}
.google-btn:hover {
  background: #ffffff;
  transform: translateY(-1px);
}
.social-text {
  font-size: 15px;
  font-weight: 600;
}

/* 하단 회원가입 링크 */
.card-footer {
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  color: #9ca3af;
}

.link-btn {
  background: transparent;
  border: none;
  color: #72d6f5;
  font-weight: 700;
  cursor: pointer;
  margin-left: 4px;
  padding: 4px;
}
.link-btn:hover {
  text-decoration: underline;
  color: #fff;
}

/* 모바일 반응형 */
@media (max-width: 900px) {
  .page-container {
    padding: 12px;
  }

  .feed-body.glass-panel-body {
    padding: 24px;
  }

  .folder-tab {
    min-width: 0;
    width: 100%;
    border-radius: 16px 16px 0 0;
  }
}
</style>
