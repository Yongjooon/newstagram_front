<template>
  <main class="page-container">
    <section class="feed-card-layout">
      <div class="feed-body glass-panel-body">
        <div class="signup-content-wrapper">
          <div class="card-head">
            <p class="title">
              {{ theme === "dark" ? "Newstagram" : "Newsreads" }}에 오신 것을
              환영합니다.
            </p>
            <div class="card-footer">
              <span>이미 가입한 계정이 있으신가요?</span>
              <button
                type="button"
                class="link-btn"
                @click="goLogin"
                :disabled="loading.signup"
              >
                로그인으로
              </button>
            </div>
          </div>

          <div class="signup-form">
            <div class="input-group">
              <label class="label">휴대폰 번호</label>
              <div class="input-row">
                <input
                  v-model="form.phoneNumber"
                  type="text"
                  placeholder="01012345678"
                  @blur="onBlurPhone"
                  class="input-dark flex-grow"
                  :disabled="verifyOk"
                />
                <button
                  type="button"
                  class="btn-glass"
                  @click="onClickRequestCode"
                  :disabled="!canRequestCode || verifyOk"
                >
                  {{ verifyOk ? "인증완료" : "인증번호 받기" }}
                </button>
              </div>

              <div class="validation-msg" :style="{ color: phoneMsgColor }">
                <span>{{ phoneMsg }}</span>
                <svg
                  v-if="availability.phone === true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="#4ade80"
                  class="success-icon"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  />
                </svg>
              </div>

              <transition name="slide-fade">
                <div v-if="showCodeArea && !verifyOk" class="verification-box">
                  <div class="input-row">
                    <input
                      v-model="verificationCode"
                      type="text"
                      placeholder="인증번호 6자리"
                      class="input-dark flex-grow"
                      maxlength="6"
                      inputmode="numeric"
                      @input="onlyNumbers"
                    />
                    <button
                      type="button"
                      class="btn-glass primary"
                      @click="onClickVerifyCode"
                      :disabled="!canVerifyCode"
                    >
                      확인
                    </button>
                  </div>

                  <div
                    class="validation-msg"
                    :style="{ color: verifyMsgColor }"
                  >
                    {{ verifyMsg }}
                  </div>

                  <div class="info-text-box">
                    <p>
                      인증번호를 발송했습니다. (유효시간 5분)<br />
                      인증번호가 오지 않으면 입력 정보를 확인해주세요.<br />
                      가상전화번호는 인증번호를 받을 수 없습니다.
                    </p>
                    <button
                      type="button"
                      class="resend-link"
                      @click="onClickResendCode"
                      :disabled="loading.requestCode"
                    >
                      코드 재전송
                    </button>
                  </div>
                </div>
              </transition>
            </div>

            <div class="input-group">
              <label class="label">이메일</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="test@example.com"
                @blur="onBlurEmail"
                class="input-dark"
                autocomplete="email"
              />
              <div class="validation-msg" :style="{ color: emailMsgColor }">
                <span>{{ emailMsg }}</span>
                <svg
                  v-if="availability.email === true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="#4ade80"
                  class="success-icon"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  />
                </svg>
              </div>
            </div>

            <div class="input-group">
              <label class="label">닉네임</label>
              <input
                v-model="form.nickname"
                type="text"
                placeholder="닉네임 입력"
                @blur="onBlurNickname"
                class="input-dark"
              />
              <div class="validation-msg" :style="{ color: nicknameMsgColor }">
                <span>{{ nicknameMsg }}</span>
                <svg
                  v-if="availability.nickname === true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="#4ade80"
                  class="success-icon"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  />
                </svg>
              </div>
            </div>

            <div class="input-group">
              <label class="label">비밀번호</label>
              <div class="password-wrapper">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                  class="input-dark"
                  autocomplete="new-password"
                  @blur="onBlurPassword"
                  @input="onBlurPassword"
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
              <div class="validation-msg" :style="{ color: passwordMsgColor }">
                <span>{{ passwordMsg }}</span>
                <svg
                  v-if="availability.password === true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="#4ade80"
                  class="success-icon"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="btn-glass primary full-width margin-top-large"
            @click="onClickSignup"
            :disabled="!canSignup"
          >
            회원가입
          </button>

          <div
            v-if="signupMsg"
            class="msg-box"
            :style="{ color: signupMsgColor }"
          >
            {{ signupMsg }}
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import UserApi from "@/api/UserApi.js";

const router = useRouter();

// Password Toggle State
const showPassword = ref(false);

const form = ref({
  phoneNumber: "",
  email: "",
  nickname: "",
  password: "",
});

// 중복 체크 상태
const availability = ref({
  phone: null,
  email: null,
  nickname: null,
  password: null,
});

// 메시지
const phoneMsg = ref("");
const emailMsg = ref("");
const nicknameMsg = ref("");
const passwordMsg = ref("");

const verifyMsg = ref("");
const signupMsg = ref("");

// 색상 (Hex 코드는 App.vue의 변수 값과 일치: success #4ade80, error #f87171)
const phoneMsgColor = computed(() =>
  availability.value.phone === false ? "#f87171" : "#4ade80"
);
const emailMsgColor = computed(() =>
  availability.value.email === false ? "#f87171" : "#4ade80"
);
const nicknameMsgColor = computed(() =>
  availability.value.nickname === false ? "#f87171" : "#4ade80"
);
const passwordMsgColor = computed(() =>
  availability.value.password === false ? "#f87171" : "#4ade80"
);

const verifyOk = ref(false);
const verifyMsgColor = computed(() => (verifyOk.value ? "#4ade80" : "#f87171"));

const signupOk = ref(false);
const signupMsgColor = computed(() => (signupOk.value ? "#4ade80" : "#f87171"));

// 인증 관련
const showCodeArea = ref(false);
const verificationCode = ref("");

// 로딩
const loading = ref({
  phoneCheck: false,
  emailCheck: false,
  nicknameCheck: false,
  requestCode: false,
  verifyCode: false,
  signup: false,
});

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const getAvailable = (res) => {
  return res?.data?.available;
};

const onBlurPhone = async () => {
  const phone = (form.value.phoneNumber || "").trim();
  verifyOk.value = false;
  verifyMsg.value = "";

  if (!phone) {
    availability.value.phone = null;
    phoneMsg.value = "";
    showCodeArea.value = false;
    return;
  }

  loading.value.phoneCheck = true;
  try {
    const data = await UserApi.phoneDuplicateCheck(phone);
    const available = getAvailable(data);

    availability.value.phone = available;
    phoneMsg.value = available
      ? "가입 가능한 휴대폰 번호입니다."
      : "이미 가입된 휴대폰 번호입니다.";
    if (!available) {
      showCodeArea.value = false;
    }
  } catch (e) {
    console.log(e);
    showCodeArea.value = false;

    if (e.response && e.response.status === 400) {
      availability.value.phone = false;
      phoneMsg.value = "잘못된 휴대폰 번호 형식입니다.";
    } else {
      availability.value.phone = null;
      phoneMsg.value = "휴대폰 번호 확인 중 오류가 발생했습니다.";
    }
  } finally {
    loading.value.phoneCheck = false;
  }
};

const onBlurEmail = async () => {
  const email = (form.value.email || "").trim();
  if (!email) {
    availability.value.email = null;
    emailMsg.value = "";
    return;
  }

  loading.value.emailCheck = true;
  try {
    const data = await UserApi.emailDuplicateCheck(email);
    const available = getAvailable(data);

    availability.value.email = available;
    emailMsg.value = available
      ? "사용 가능한 이메일입니다."
      : "이미 가입된 이메일입니다.";
  } catch (e) {
    console.log(e);

    if (e.response && e.response.status === 400) {
      availability.value.email = false;
      emailMsg.value = "잘못된 이메일 형식입니다.";
    } else {
      availability.value.email = null;
      emailMsg.value = "이메일 확인 중 오류가 발생했습니다.";
    }
  } finally {
    loading.value.emailCheck = false;
  }
};

const onBlurNickname = async () => {
  const nickname = (form.value.nickname || "").trim();
  if (!nickname) {
    availability.value.nickname = null;
    nicknameMsg.value = "";
    return;
  }

  loading.value.nicknameCheck = true;
  try {
    const data = await UserApi.nicknameDuplicateCheck(nickname);
    const available = getAvailable(data);

    availability.value.nickname = available;
    nicknameMsg.value = available
      ? "사용 가능한 닉네임입니다."
      : "이미 사용 중인 닉네임입니다.";
  } catch (e) {
    console.log(e);

    if (e.response && e.response.status === 400) {
      availability.value.nickname = false;
      nicknameMsg.value =
        "닉네임 형식이 올바르지 않습니다. (한글, 영문, 숫자 2~50자)";
    } else {
      availability.value.nickname = null;
      nicknameMsg.value = "닉네임 확인 중 오류가 발생했습니다.";
    }
  } finally {
    loading.value.nicknameCheck = false;
  }
};

const onBlurPassword = () => {
  const pw = form.value.password;

  if (!pw) {
    availability.value.password = null;
    passwordMsg.value = "";
    return;
  }

  const isValidChars = /^[a-zA-Z0-9!@#$%]*$/.test(pw);

  if (!isValidChars) {
    availability.value.password = false;
    passwordMsg.value =
      "사용할 수 없는 특수문자가 포함되어 있습니다. (!@#$%만 가능)";
    return;
  }

  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSpecial = /[!@#$%]/.test(pw);

  let count = 0;
  if (hasLetter) count++;
  if (hasDigit) count++;
  if (hasSpecial) count++;

  if (count >= 2) {
    if (pw.length < 8) {
      availability.value.password = false;
      passwordMsg.value = "비밀번호는 최소 8자 이상이어야 합니다.";
    } else {
      availability.value.password = true;
      passwordMsg.value = "사용 가능한 비밀번호입니다.";
    }
  } else {
    availability.value.password = false;
    passwordMsg.value =
      "영문, 숫자, 특수문자(!@#$%) 중 2가지 이상을 조합해주세요.";
  }
};

const canRequestCode = computed(() => {
  const phone = (form.value.phoneNumber || "").trim();
  return (
    !!phone &&
    availability.value.phone === true &&
    !loading.value.requestCode &&
    !loading.value.phoneCheck
  );
});

const onClickRequestCode = async () => {
  const phone = (form.value.phoneNumber || "").trim();
  if (!phone) return;

  loading.value.requestCode = true;
  verifyOk.value = false;
  verifyMsg.value = "";

  try {
    await UserApi.requestPhoneVerification(phone);
    showCodeArea.value = true;
    verifyMsg.value = "인증 코드가 전송되었습니다.";
  } catch (e) {
    console.log(e);
    showCodeArea.value = false;
    verifyMsg.value = "인증 코드 전송 중 오류가 발생했습니다.";
  } finally {
    loading.value.requestCode = false;
  }
};

const onClickResendCode = async () => {
  await onClickRequestCode();
};

const canVerifyCode = computed(() => {
  const phone = (form.value.phoneNumber || "").trim();
  const code = (verificationCode.value || "").trim();
  return !!phone && !!code && showCodeArea.value && !loading.value.verifyCode;
});

const onClickVerifyCode = async () => {
  const phone = (form.value.phoneNumber || "").trim();
  const code = (verificationCode.value || "").trim();
  if (!phone || !code) {
    verifyMsg.value = "휴대폰 번호와 인증 코드를 입력해주세요.";
    return;
  }

  loading.value.verifyCode = true;
  verifyOk.value = false;
  verifyMsg.value = "";

  try {
    await UserApi.verifyPhoneCode(phone, code);
    verifyOk.value = true;
    verifyMsg.value = "휴대폰 인증이 완료되었습니다.";
    phoneMsg.value = null;
  } catch (e) {
    console.log(e);
    verifyOk.value = false;

    if (e.response && e.response.status === 400) {
      verifyMsg.value = "인증번호가 일치하지 않거나 만료되었습니다.";
    } else {
      verifyMsg.value = "인증 확인 중 오류가 발생했습니다.";
    }
  } finally {
    loading.value.verifyCode = false;
  }
};

const canSignup = computed(() => {
  const phone = (form.value.phoneNumber || "").trim();
  const email = (form.value.email || "").trim();
  const nickname = (form.value.nickname || "").trim();
  const password = (form.value.password || "").trim();

  return (
    !!phone &&
    !!email &&
    !!nickname &&
    !!password &&
    availability.value.phone === true &&
    availability.value.email === true &&
    availability.value.nickname === true &&
    availability.value.password === true &&
    verifyOk.value === true &&
    !loading.value.signup
  );
});

const onClickSignup = async () => {
  signupOk.value = false;
  signupMsg.value = "";
  loading.value.signup = true;

  try {
    await UserApi.signup({
      phoneNumber: (form.value.phoneNumber || "").trim(),
      email: (form.value.email || "").trim(),
      password: (form.value.password || "").trim(),
      nickname: (form.value.nickname || "").trim(),
    });

    signupOk.value = true;
    signupMsg.value = "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.";
    alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
    router.push("/user");
  } catch (e) {
    console.log(e);
    signupOk.value = false;
    signupMsg.value = "회원가입 중 오류가 발생했습니다.";
  } finally {
    loading.value.signup = false;
  }
};

const goLogin = () => {
  router.push("/user");
};

const onlyNumbers = (event) => {
  const val = event.target.value.replace(/[^0-9]/g, "");
  verificationCode.value = val;
};
</script>

<style scoped>
/* ✅ 레이아웃 (공통) */
.page-container {
  height: fit-content;
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

.header-right-area {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  padding-right: 16px;
  padding-bottom: 8px;
}

/* ✅ 본문 (유리 패널) */
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

/* ✅ 콘텐츠 스타일 */
.signup-content-wrapper {
  display: flex;
  flex-direction: column;
}

/* 타이틀 섹션 */
.card-head {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary); /* 변수 사용 */
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 15px;
  color: var(--text-secondary); /* 변수 사용 */
  margin: 0;
}

/* 폼 스타일 */
.signup-form {
  display: flex;
  flex-direction: column;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  color: var(--text-primary); /* 변수 사용 */
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
}

.input-row {
  display: flex;
  width: 100%;
  gap: 8px;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.flex-grow {
  flex: 1;
}

/* 다크 모드 입력 필드 */
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
  background: var(--bg-input);
  box-shadow: 0 0 0 2px rgba(114, 214, 245, 0.1);
}

.input-dark:disabled {
  background: var(--bg-button-glass); /* 변수 사용 */
  color: var(--text-secondary); /* 변수 사용 */
  cursor: not-allowed;
  border-color: var(--border-glass); /* 변수 사용 */
}

/* 유효성 메시지 */
.validation-msg {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  min-height: 20px;
}

.success-icon {
  flex-shrink: 0;
}

/* 인증 박스 (내부) */
.verification-box {
  background: var(--bg-input); /* 변수 사용 */
  border: 1px dashed var(--accent-color); /* 변수 사용 */
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-text-box {
  margin-top: 8px;
  border-top: 1px solid var(--divider); /* 변수 사용 */
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-text-box p {
  font-size: 12px;
  color: var(--text-secondary); /* 변수 사용 */
  line-height: 1.6;
  margin: 0;
}

.resend-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  color: var(--accent-color); /* 변수 사용 */
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  align-self: flex-start;
  margin-top: 4px;
}
.resend-link:hover {
  color: var(--text-primary);
}

/* 버튼 스타일 (유리 질감) */
.btn-glass {
  background: var(--bg-button-glass); /* 변수 사용 */
  border: 1px solid var(--border-glass); /* 변수 사용 */
  color: var(--text-secondary);
  padding: 0 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-glass:hover:not(:disabled) {
  background: var(--border-glass);
  color: var(--text-primary);
  border-color: var(--text-primary);
}

.btn-glass.primary {
  background: rgba(114, 214, 245, 0.15); /* 포인트 색상 고정 or 변수화 */
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.btn-glass.primary:hover:not(:disabled) {
  background: var(--accent-color);
  color: #fff; /* 활성 상태 텍스트는 흰색 */
  box-shadow: 0 0 15px rgba(114, 214, 245, 0.2);
}

.btn-glass:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-glass.small {
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
}

.full-width {
  width: 100%;
}

.margin-top-large {
  margin-top: 40px;
}

/* 비밀번호 토글 */
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

/* 하단 링크 */
.card-footer {
  margin-top: 20px;
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

.msg-box {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  margin-top: 10px;
}

/* 애니메이션 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* 모바일 반응형 */
@media (max-width: 640px) {
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
