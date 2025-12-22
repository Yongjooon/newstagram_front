<template>
  <div class="page">
    <div class="card card--padded">
      <div class="page-head">
        <h1 class="page-title">비밀번호 재설정</h1>
        <button class="btn-ghost" type="button" @click="goLogin">로그인으로</button>
      </div>

      <div v-if="!token" class="muted" style="color:#ef4444;">
        유효한 토큰이 없습니다. 이메일로 받은 링크로 다시 접속해 주세요.
      </div>

      <form class="form" @submit.prevent="onChange" v-else>
        <div class="field">
          <label>새 비밀번호</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="8자 이상, 영문/숫자/특수문자 포함"
            autocomplete="new-password"
          />
          <div v-if="newPassword && !isPasswordValid" class="muted" style="color:#ef4444; font-size:12px;">
            비밀번호는 8자 이상이며, 영문/숫자/특수문자를 모두 포함해야 합니다.
          </div>
        </div>

        <div class="field">
          <label>비밀번호 확인</label>
          <input
            v-model="newPasswordConfirm"
            type="password"
            placeholder="비밀번호를 한 번 더 입력"
            autocomplete="new-password"
          />
          <div v-if="newPasswordConfirm && !isPasswordMatch" class="muted" style="color:#ef4444; font-size:12px;">
            비밀번호가 일치하지 않습니다.
          </div>
        </div>

        <div v-if="message" class="muted" :style="{ color: messageOk ? '#059669' : '#ef4444' }">
          {{ message }}
        </div>

        <div class="actions">
          <button class="btn-primary" type="submit" :disabled="changing || !canSubmit">
            {{ changing ? '변경 중...' : '비밀번호 변경' }}
          </button>
        </div>

        <p class="muted" style="margin: 6px 0 0; font-size:12px; line-height:1.5;">
          비밀번호 변경이 완료되면, 기존 토큰은 즉시 폐기됩니다.
        </p>
      </form>
    </div>
  </div>
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

const isPasswordValid = computed(() => passwordRule.test(String(newPassword.value || "")));
const isPasswordMatch = computed(
  () => String(newPassword.value || "") === String(newPasswordConfirm.value || "")
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
    message.value = "비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.";
    router.push({ name: "user" });
  } catch (err) {
    const status = err?.response?.status;
    if (status === 400) {
      message.value = "유효하지 않거나 만료된 토큰입니다. 이메일로 받은 링크를 다시 확인해 주세요.";
    } else {
      message.value = err?.response?.data?.message || "비밀번호 변경에 실패했습니다.";
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
</style>
