<template>
  <div class="page">
    <div class="card card--padded">
      <div class="page-head">
        <h1 class="page-title">소셜 로그인</h1>
        <button class="btn-ghost" type="button" @click="goLogin">로그인으로</button>
      </div>

      <p class="muted" style="margin: 0 0 14px; font-size: 13px; line-height: 1.6;">
        Google 계정으로 로그인합니다. 최초 로그인인 경우 임시 계정이 생성될 수 있으며,
        이후 휴대폰 인증이 필요할 수 있습니다.
      </p>

      <div class="actions">
        <button class="btn-primary" type="button" @click="startGoogleOAuth">
          Google로 계속하기
        </button>
        <button type="button" @click="goLogin">취소</button>
      </div>

      <p v-if="message" class="muted" :style="{ color: ok ? '#059669' : '#ef4444', marginTop: '10px' }">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import UserApi from "../../api/UserApi";

const router = useRouter();

const ok = ref(false);
const message = ref("");

function startGoogleOAuth() {
  message.value = "";
  ok.value = false;

  const url = UserApi.getGoogleOAuthStartUrl();

  window.open(url, "_blank", "noopener,noreferrer");

  ok.value = true;
  message.value = "새 탭에서 Google 로그인 화면이 열립니다. 로그인을 완료해 주세요.";
}

function goLogin() {
  router.push({ name: "user" });
}
</script>

<style scoped>
</style>
