<template>
  <div class="page">
    <div class="login-card">
      <div class="card-head">
        <h1 class="title">로그인</h1>
        <p class="subtitle">Newstagram에 오신 것을 환영합니다!</p>
      </div>

      <form class="login-form" @submit.prevent="login">
        <div class="input-group">
          <label class="input-label">이메일</label>
          <input
            v-model="loginUser.email"
            type="email"
            placeholder="Enter Email"
            class="custom-input"
            autocomplete="email"
          />
        </div>

        <div class="input-group">
          <label class="input-label">비밀번호</label>
          <div class="input-wrapper">
            <input 
              v-model="loginUser.password" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password" 
              class="custom-input"
              autocomplete="current-password"
            />
            <!-- <button type="button" class="toggle-pwd-btn" @click="togglePassword">
              {{ showPassword ? 'Show' : 'Hide' }}
            </button> -->
            <button type="button" class="toggle-pwd-btn" @click="togglePassword">
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="form-helper">
          <span type="button" class="helper-text" @click="goFindId">이메일 찾기</span>
          <span type="button" class="helper-text" @click="goFindPwd">비밀번호 재설정</span>
       </div>
       

        <button class="btn-login" type="submit">로그인</button>
        
        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">또는</span>
          <span class="divider-line"></span>
        </div>

        <div class="social-buttons">
          <a
            :href="`${baseUrl}/api/oauth2/authorization/google`"
              target="_blank"
              class="btn-social"
          >
            <img src="/src/assets/google_logo.svg" alt="Google" width="20" />
            <span class="social-text">Google 계정으로 로그인</span>
          </a>
        </div>
        
        <div class="card-footer">
          <span>계정이 없으신가요? </span>
          <button type="button" class="link-btn" @click="goSignup">회원가입</button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from '../../stores/user';

const baseUrl = import.meta.env.VITE_API_URL;

const router = useRouter();
const userStore = useUserStore();

// Password Toggle State
const showPassword = ref(false);

const loginUser = reactive({
  email: '',
  password: '',
})

const togglePassword = () => {
  showPassword.value = !showPassword.value;
}

const login = async () => {
  try {
    const res = await userStore.login(loginUser);
    if (res.data.initialized === false) {
      router.push({ path: "/survey" });
    } else {
      router.push({ name: "home" });
    }
  } catch (error) {
    alert(error?.message || "로그인에 실패했습니다.");
  }
}

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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F8F5F1; /* 부드러운 배경색 */
  background-image: radial-gradient(#E8E0D5 1px, transparent 1px);
  background-size: 20px 20px;
  font-family: 'Inter', sans-serif;
  padding: 20px;
}

.login-card {
width: 100%;
max-width: 480px;
background: #ffffff;
border-radius: 24px;
padding: 40px;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05);
display: flex;
flex-direction: column;
text-align: center;
}

/* Header */
.card-header {
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #111;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
}

  /* Form Layout */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Inputs  */
.input-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 라벨 왼쪽 정렬 강제 */
  width: 100%;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px; /* 인풋과의 간격 */
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.custom-input {
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  font-size: 15px;
  color: #111;
  background-color: #fff;
  transition: all 0.2s ease;
  outline: none;
}

.custom-input::placeholder {
  color: #ccc;
}

/* Focus Action: Black Border */
.custom-input:focus {
  border-color: #111; 
  box-shadow: 0 0 0 1px #111;
}

.pwd-input {
  padding-right: 60px;
}

.toggle-pwd-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  cursor:default;
}

.toggle-pwd-btn:hover {
  color: #111;
}

.btn-login {
  background: #111827;
  color: #fff;
  border-color: #111827;
  height: 48px;
  font-size: 14px;
  font-weight: 600;
}

/* Helper Text */
.form-helper {
  text-align: right;
  margin-top: -15px;
  margin-bottom: 10px;
}

.helper-text {
  font-size: 14px;
  color: #111;
  cursor: pointer;
  font-weight: 500;
  margin-left: 10px;
}

.helper-text:hover {
  text-decoration: underline;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  margin: 0;
  color: #111;
  font-weight: 500;
  font-size: 14px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #111;
}

.divider-text {
  padding: 0 16px;
  background: #fff;
}

/* Social Buttons */
.social-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
}

.btn-social {
  flex: 1;
  height: 48px;
  background: #fff;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s;
  color: #333;
}

.btn-social:hover {
  background-color: #F9F9F9;
}

.social-text {
  font-size: 14px;
  font-weight: 600;
}

.social-icon {
  width: 20px;
  height: 20px;
}

/* Google Social Button Specifics to match link style */
a.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

/* Footer */
.card-footer {
  font-size: 14px;
  color: #666;
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-weight: 700;
  color: #111;
  cursor: pointer;
  margin-left: 4px;
}

.link-btn:hover {
  text-decoration: underline;
}

</style>
