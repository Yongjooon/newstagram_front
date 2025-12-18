<template>
  <main>
    <h1>Find Password</h1>

    <section>
      <p>비밀번호 재설정 요청 화면(임시)</p>

      <div>
        <label>
          이메일
          <input v-model="email" type="email" placeholder="email@example.com" />
        </label>
      </div>

      <div style="display:flex; gap:8px; margin-top:12px;">
        <button type="button" @click="requestReset" :disabled="!email.trim()">재설정 링크 요청</button>
        <button type="button" @click="goLogin">로그인으로</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const email = ref("");

function requestReset() {
  // TODO: 비밀번호 재설정 요청 API
  console.log("requestReset:", email.value);
  alert("비밀번호 재설정 요청(임시)");
}

function goLogin() {
  router.push({ name: "user" });
}
</script>


<style scoped></style>