<template>
  <div class="page">
    <div class="card card--padded">
      <div class="page-head">
        <h1 class="page-title">로그인</h1>
        <span class="badge">Newstagram</span>
      </div>

      <form class="form" @submit.prevent="login">
        <div class="field">
          <label>이메일</label>
          <input v-model="loginUser.email" type="email" placeholder="email@example.com" autocomplete="email" />
        </div>

        <div class="field">
          <label>비밀번호</label>
          <input v-model="loginUser.password" type="password" placeholder="password" autocomplete="current-password" />
        </div>

        <div class="actions">
          <button class="btn-primary" type="submit">로그인</button>
          <button type="button" @click="goSignup">회원가입</button>
        </div>

        <div class="actions">
          <button type="button" @click="goFindId">아이디 찾기</button>
          <button type="button" @click="goFindPwd">비밀번호 찾기</button>
        </div>

        <div class="actions">
          <button class="btn-ghost" type="button" @click="goSocialSignup">소셜 로그인</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from '../../stores/user';

const router = useRouter();
const userStore = useUserStore();

const loginUser = reactive({
  email: '',
  password: '',
})

const login = async () => {
  try {
    await userStore.login(loginUser);
    router.push({ name: "home" });
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
function goSocialSignup() {
  router.push({ name: "SocialSignup" });
}
</script>

<style scoped>
</style>
