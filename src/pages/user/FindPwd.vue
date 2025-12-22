<template>
  <div class="page">
    <div class="card card--padded">
      <div class="page-head">
        <h1 class="page-title">비밀번호 찾기</h1>
        <button class="btn-ghost" type="button" @click="goLogin">로그인으로</button>
      </div>

      <form class="form" @submit.prevent="onSend">
        <div class="field">
          <label>이메일</label>
          <input
            v-model="email"
            type="email"
            placeholder="email@example.com"
            autocomplete="email"
          />
        </div>

        <div v-if="message" class="muted" :style="{ color: messageOk ? '#059669' : '#ef4444' }">
          {{ message }}
        </div>

        <div class="actions">
          <button class="btn-primary" type="submit" :disabled="sending || !canSend">
            {{ sending ? '전송 중...' : '코드 보내기' }}
          </button>
          <button type="button" @click="goLogin">취소</button>
        </div>

        <p class="muted" style="margin: 6px 0 0; font-size: 12px; line-height: 1.5;">
          입력하신 이메일로 비밀번호 재설정용 코드(토큰)가 전송됩니다.
        </p>
      </form>
    </div>
  </div>
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
    message.value = "이메일로 코드가 전송되었습니다.";
  } catch (err) {
    messageOk.value = false;
    message.value = err?.response?.data?.message || "요청에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  } finally {
    sending.value = false;
  }
}

function goLogin() {
  router.push({ name: "user" });
}
</script>

<style scoped>
</style>
