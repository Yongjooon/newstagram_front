<template>
  <main class="page-container">
    <section class="feed-card-layout">
      <header class="feed-header">
        <div class="folder-tab">
          <h2 class="desktop-label">🔒 비밀번호 재설정</h2>
        </div>

        <div class="header-right-area">
          <button class="btn-glass small" type="button" @click="goLogin">
            로그인으로
          </button>
        </div>
      </header>

      <div class="feed-body glass-panel-body">
        <div v-if="!token" class="status-box error">
          <p class="status-title">유효하지 않은 접근입니다</p>
          <p class="status-desc">
            이메일로 받은 링크를 통해 다시 접속해 주세요.
          </p>
        </div>

        <form v-else class="content-wrapper" @submit.prevent="onChange">
          <div class="info-grid">
            <div class="input-group">
              <label class="label">새 비밀번호</label>
              <input
                v-model="newPassword"
                type="password"
                placeholder="8자 이상, 영문/숫자/특수문자 포함"
                autocomplete="new-password"
                class="input-dark"
              />
              <p
                v-if="newPassword"
                class="hint-text"
                :style="{ color: isPasswordValid ? '#4ade80' : '#f87171' }"
              >
                {{
                  isPasswordValid
                    ? "사용 가능한 비밀번호입니다."
                    : "8자 이상, 영문/숫자/특수문자를 모두 포함해야 합니다."
                }}
              </p>
            </div>

            <div class="input-group">
              <label class="label">비밀번호 확인</label>
              <input
                v-model="newPasswordConfirm"
                type="password"
                placeholder="비밀번호를 한 번 더 입력"
                autocomplete="new-password"
                class="input-dark"
              />
              <p
                v-if="newPasswordConfirm"
                class="hint-text"
                :style="{ color: isPasswordMatch ? '#4ade80' : '#f87171' }"
              >
                {{
                  isPasswordMatch
                    ? "비밀번호가 일치합니다."
                    : "비밀번호가 일치하지 않습니다."
                }}
              </p>
            </div>

            <div
              v-if="message"
              class="msg-box"
              :style="{ color: messageOk ? '#4ade80' : '#f87171' }"
            >
              {{ message }}
            </div>

            <div class="action-row">
              <button
                class="btn-glass primary full-width"
                type="submit"
                :disabled="changing || !canSubmit"
              >
                {{ changing ? "변경 중..." : "비밀번호 변경" }}
              </button>
            </div>

            <p class="description-text">
              비밀번호 변경이 완료되면, 기존 토큰은 즉시 폐기됩니다.
            </p>
          </div>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import UserApi from "../../api/UserApi";

const route = useRoute();
const router = useRouter();

const token = computed(() => String(route.query.token || "").trim());

const newPassword = ref("");
const newPasswordConfirm = ref("");
const changing = ref(false);
const messageOk = ref(false);
const message = ref("");
const passwordRule = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const isPasswordValid = computed(() =>
  passwordRule.test(String(newPassword.value || ""))
);

const isPasswordMatch = computed(
  () =>
    newPassword.value &&
    String(newPassword.value || "") === String(newPasswordConfirm.value || "")
);

const canSubmit = computed(() => {
  return !!token.value && isPasswordValid.value && isPasswordMatch.value;
});

async function onChange() {
  message.value = "";
  messageOk.value = false;
  if (!canSubmit.value) return;

  changing.value = true;
  try {
    await UserApi.resetPassword(token.value, newPassword.value);
    messageOk.value = true;
    // message.value = "비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.";
    alert("비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.");
    router.push({ name: "user" });
  } catch (err) {
    const status = err?.response?.status;
    if (status === 400) {
      message.value =
        "유효하지 않거나 만료된 토큰입니다. 이메일로 받은 링크를 다시 확인해 주세요.";
    } else {
      message.value =
        err?.response?.data?.message || "비밀번호 변경에 실패했습니다.";
    }
    messageOk.value = false;
  } finally {
    changing.value = false;
  }
}

function goLogin() {
  router.push({ name: "user" });
}
</script>

<style scoped>
/* ✅ 레이아웃 (공통) */
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

  background-color: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 24px 24px 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  z-index: 4;
}

/* ✅ 콘텐츠 스타일 */
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
  color: #9ca3af;
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
}

/* 다크 모드 입력 필드 */
.input-dark {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 12px 16px;
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

/* 메시지 텍스트 */
.hint-text {
  font-size: 13px;
  margin: 4px 0 0 4px;
}

.msg-box {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  margin-top: -8px;
}

.description-text {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.5;
  margin: 0;
  text-align: center;
}

/* 에러 상태 박스 */
.status-box {
  background: rgba(248, 113, 113, 0.1);
  border: 1px dashed rgba(248, 113, 113, 0.5);
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  margin-top: 20px;
}
.status-title {
  font-size: 16px;
  font-weight: 800;
  color: #f87171;
  margin-bottom: 8px;
}
.status-desc {
  font-size: 14px;
  color: #fca5a5;
}

/* 버튼 스타일 */
.btn-glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ccc;
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
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-glass.primary {
  background: rgba(114, 214, 245, 0.15);
  border-color: rgba(114, 214, 245, 0.4);
  color: #72d6f5;
}

.btn-glass.primary:hover:not(:disabled) {
  background: rgba(114, 214, 245, 0.3);
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

.full-width {
  width: 100%;
}

/* 모바일 반응형 */
@media (max-width: 640px) {
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
