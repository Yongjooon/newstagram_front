<template>
  <main>
    <h1>Social Signup</h1>

    <section>
      <p>소셜 로그인 후 최초 가입 시 추가 정보 입력(임시)</p>

      <div>
        <label>
          소셜 제공자
          <select v-model="provider">
            <option value="google">Google</option>
            <option value="kakao">Kakao</option>
            <option value="naver">Naver</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          닉네임
          <input v-model="nickname" type="text" placeholder="nickname" />
        </label>
      </div>

      <div style="display:flex; gap:8px; margin-top:12px;">
        <button type="button" @click="complete" :disabled="!nickname.trim()">가입 완료</button>
        <button type="button" @click="goLogin">로그인으로</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const provider = ref("google");
const nickname = ref("");

function complete() {
  // TODO: 소셜 가입 완료 API
  console.log("social signup:", { provider: provider.value, nickname: nickname.value });
  alert("소셜 가입 완료(임시) → Home 이동");
  router.push({ name: "Home" });
}

function goLogin() {
  router.push({ name: "user" });
}
</script>


<style scoped></style>