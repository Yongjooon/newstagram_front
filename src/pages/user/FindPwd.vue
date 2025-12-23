<template>
  <main class="page-container">
    <section class="feed-card-layout">
      <header class="feed-header">
        <div class="folder-tab">
          <h2 class="desktop-label">🔒 비밀번호 찾기</h2>
        </div>

        <div class="header-right-area">
          <button class="btn-glass small" type="button" @click="goLogin">
            로그인으로
          </button>
        </div>
      </header>

      <div class="feed-body glass-panel-body">
        <form class="content-wrapper" @submit.prevent="onSend">
          <div class="info-grid">
            <div class="input-group">
              <label class="label">가입한 이메일</label>
              <input
                v-model="email"
                type="email"
                placeholder="email@example.com"
                autocomplete="email"
                class="input-dark"
              />
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
                :disabled="sending || !canSend"
              >
                {{ sending ? "전송 중..." : "코드 보내기" }}
              </button>
            </div>

            <p class="description-text">
              입력하신 이메일로 비밀번호 재설정 링크가 전송됩니다. <br />
              메일 내용과 재설정 링크를 타인에게 유출하지 마세요.
            </p>
          </div>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import UserApi from "../../api/UserApi";

const router = useRouter();

const email = ref("");
const sending = ref(false);
const messageOk = ref(false);
const message = ref("");

const canSend = computed(() => String(email.value || "").trim().length > 3);

async function onSend() {
  message.value = "";
  messageOk.value = false;

  const e = String(email.value || "").trim();
  if (!e) return;

  sending.value = true;
  try {
    await UserApi.sendPasswordResetRequest(e);
    messageOk.value = true;
    message.value = "해당 이메일로 비밀번호 재설정 링크가 전송되었습니다.";
  } catch (err) {
    messageOk.value = false;
    message.value =
      err?.response?.data?.message ||
      "요청에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  } finally {
    sending.value = false;
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
  min-width: 180px;
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

/* 메시지 박스 */
.msg-box {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  margin-top: -8px;
}

/* 설명 텍스트 */
.description-text {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.5;
  margin: 0;
  text-align: center;
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
