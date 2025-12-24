<template>
  <main class="page-container">
    <section class="feed-card-layout">
      <header class="feed-header">
        <div class="folder-tab">
          <h2 class="desktop-label">📧 이메일 찾기</h2>
        </div>

        <div class="header-right-area">
          <button class="btn-glass small" type="button" @click="goLogin">
            로그인으로
          </button>
        </div>
      </header>

      <div class="feed-body glass-panel-body">
        <form class="content-wrapper" @submit.prevent="onVerifyCode">
          <div class="info-grid">
            <div class="input-group">
              <label class="label">휴대폰 번호</label>
              <div class="input-row">
                <input
                  v-model="phoneNumber"
                  type="text"
                  placeholder="01012345678"
                  class="input-dark"
                />
                <button
                  type="button"
                  class="btn-glass"
                  @click="onSendCode"
                  :disabled="!canSendCode || sending"
                >
                  {{ sending ? "전송 중.." : "인증번호 발송" }}
                </button>
              </div>
              <p v-if="msg" class="hint-text" :style="{ color: msgColor }">
                {{ msg }}
              </p>
            </div>

            <transition name="slide-fade">
              <div v-if="showVerifyArea" class="input-group">
                <label class="label">인증코드</label>
                <div class="input-row">
                  <input
                    v-model="verificationCode"
                    type="text"
                    placeholder="인증번호 6자리"
                    class="input-dark"
                  />
                  <button
                    class="btn-glass primary"
                    type="submit"
                    :disabled="!canVerify || verifying"
                  >
                    확인
                  </button>
                </div>
                <p
                  v-if="verifyMsg"
                  class="hint-text"
                  :style="{ color: verifyMsgColor }"
                >
                  {{ verifyMsg }}
                </p>
              </div>
            </transition>

            <transition name="slide-fade">
              <div v-if="foundEmail" class="result-box">
                <div class="result-label">조회된 이메일</div>

                <div class="result-value-row">
                  <span class="result-value">{{ foundEmail }}</span>

                  <button
                    type="button"
                    class="copy-btn"
                    @click="copyEmail"
                    :title="copied ? '복사 완료' : '이메일 복사'"
                  >
                    <svg
                      v-if="copied"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="icon-check"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clip-rule="evenodd"
                      />
                    </svg>

                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      class="icon-copy"
                    >
                      <g clip-path="url(#clip0_2_54)">
                        <path
                          d="M11 5.00781V4.2C11 3.0799 11 2.51984 10.782 2.09202C10.5903 1.71569 10.2843 1.40973 9.90798 1.21799C9.48016 1 8.9201 1 7.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V7.8C1 8.9201 1 9.48016 1.21799 9.90798C1.40973 10.2843 1.71569 10.5903 2.09202 10.782C2.51984 11 3.0799 11 4.2 11H5M8.2 15H11.8C12.9201 15 13.4802 15 13.908 14.782C14.2843 14.5903 14.5903 14.2843 14.782 13.908C15 13.4802 15 12.9201 15 11.8V8.2C15 7.07989 15 6.51984 14.782 6.09202C14.5903 5.71569 14.2843 5.40973 13.908 5.21799C13.4802 5 12.9201 5 11.8 5H8.2C7.07989 5 6.51984 5 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.51984 5 7.07989 5 8.2V11.8C5 12.9201 5 13.4802 5.21799 13.908C5.40973 14.2843 5.71569 14.5903 6.09202 14.782C6.51984 15 7.07989 15 8.2 15Z"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2_54">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import UserApi from "../../api/UserApi";

const router = useRouter();

const phoneNumber = ref("");
const verificationCode = ref("");

const showVerifyArea = ref(false);
const sending = ref(false);
const verifying = ref(false);

const msgOk = ref(false);
const msg = ref("");

const verifyOk = ref(false);
const verifyMsg = ref("");

const foundEmail = ref("");
const copied = ref(false); // ✅ 복사 상태 관리

const msgColor = computed(() => (msgOk.value ? "#4ade80" : "#f87171"));
const verifyMsgColor = computed(() => (verifyOk.value ? "#4ade80" : "#f87171"));

const canSendCode = computed(() => !!(phoneNumber.value || "").trim());
const canVerify = computed(
  () => showVerifyArea.value && !!(verificationCode.value || "").trim()
);

/* ✅ 이메일 복사 함수 */
const copyEmail = async () => {
  if (!foundEmail.value) return;

  try {
    await navigator.clipboard.writeText(foundEmail.value);
    copied.value = true;

    // 2초 후 아이콘 원복
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("복사 실패:", err);
  }
};

const onSendCode = async () => {
  if (!canSendCode.value) return;
  sending.value = true;
  msg.value = "";
  foundEmail.value = "";
  copied.value = false; // 리셋

  try {
    const res = await UserApi.sendEmailFindCode(phoneNumber.value);
    if (res?.ok === false) {
      msgOk.value = false;
      msg.value = res?.user_message || "인증코드 발송에 실패했습니다.";
      showVerifyArea.value = false;
      return;
    }
    msgOk.value = true;
    msg.value = "인증코드를 발송했습니다.";
    showVerifyArea.value = true;
  } catch (e) {
    console.log(e);
    msgOk.value = false;
    msg.value = "인증코드 발송 중 오류가 발생했습니다.";
    showVerifyArea.value = false;
  } finally {
    sending.value = false;
  }
};

const onVerifyCode = async () => {
  if (!canVerify.value) return;
  verifying.value = true;
  copied.value = false;

  try {
    const res = await UserApi.findUserEmail(
      phoneNumber.value,
      verificationCode.value
    );

    const email = res?.data?.email || res?.email || "";
    if (!email) {
      verifyOk.value = false;
      verifyMsg.value = "인증번호가 올바르지 않거나 만료되었습니다.";
      foundEmail.value = "";
      return;
    }

    foundEmail.value = email;
    verifyOk.value = true;
    verifyMsg.value = "인증이 완료되었습니다.";
  } catch (e) {
    console.log("Error finding email", e);
    verifyOk.value = false;
    verifyMsg.value =
      e?.response?.data?.error?.message ||
      e?.response?.data?.message ||
      "인증번호가 올바르지 않거나 만료되었습니다.";
    foundEmail.value = "";
  } finally {
    verifying.value = false;
  }
};

const goLogin = () => router.push({ name: "user" });
</script>

<style scoped>
/* ✅ 레이아웃 */
.page-container {
  height: calc(100vh - 56px);
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
  padding-top: 10px;
}

.feed-card-layout {
  width: 100%;
  height: 100%;
  max-width: 600px;
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
  min-width: 180px;
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
  border-radius: 0 24px 24px 24px;
  box-shadow: var(--shadow-panel); /* 변수 사용 */
  z-index: 4;
}

/* ✅ 폼 스타일 */
.content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  color: var(--text-secondary); /* 변수 사용 */
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
}

.input-row {
  display: flex;
  gap: 8px;
}

/* 입력 필드 */
.input-dark {
  flex: 1;
  width: 100%;
  background: var(--bg-input); /* 변수 사용 */
  border: 1px solid var(--border-glass); /* 변수 사용 */
  color: var(--text-primary); /* 변수 사용 */
  padding: 12px 16px;
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

.hint-text {
  font-size: 13px;
  margin: 4px 0 0 4px;
  /* color는 인라인 스타일로 바인딩됨 */
}

/* 버튼 */
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
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-glass:hover:not(:disabled) {
  background: var(--border-glass);
  color: var(--text-primary);
}

.btn-glass.primary {
  background: rgba(114, 214, 245, 0.15); /* 강조 버튼은 고정색 유지 or 변수화 */
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.btn-glass.primary:hover:not(:disabled) {
  background: var(--accent-color);
  color: #fff;
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

/* ✅ 결과 박스 */
.result-box {
  margin-top: 16px;
  background: rgba(114, 214, 245, 0.1);
  border: 1px dashed var(--accent-color);
  padding: 20px;
  border-radius: 16px;
  text-align: center;
}

.result-label {
  font-size: 13px;
  color: var(--text-secondary); /* 변수 사용 */
  margin-bottom: 8px;
}

/* 결과 값과 버튼 */
.result-value-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.result-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary); /* 변수 사용 */
  word-break: break-all;
}

/* 복사 아이콘 버튼 */
.copy-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary); /* 변수 사용 */
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.copy-btn:hover {
  color: var(--text-primary);
  transform: scale(1.1);
}

.icon-copy,
.icon-check {
  width: 20px;
  height: 20px;
}

.icon-check {
  color: var(--success-color); /* 변수 사용 */
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
@media (max-width: 900px) {
  .page-container {
    padding: 12px;
  }

  .feed-body.glass-panel-body {
    padding: 24px 16px;
  }

  .folder-tab {
    min-width: 0;
    border-radius: 16px 16px 0 0;
  }
}
</style>
