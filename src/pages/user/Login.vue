<template>
  <main>
    <h1>Login</h1>

    <section>
      <div>
        <label>
          이메일
          <input v-model="loginUser.email" type="email" placeholder="email@example.com" />
        </label>
      </div>

      <div>
        <label>
          비밀번호
          <input v-model="loginUser.password" type="password" placeholder="password" />
        </label>
      </div>

      <div style="display:flex; gap:8px; margin-top:12px;">
        <button type="button" @click="login" >로그인</button>
        <button type="button" @click="goSignup">회원가입</button>
      </div>

      <div style="display:flex; gap:8px; margin-top:12px;">
        <button type="button" @click="goFindId">아이디 찾기</button>
        <button type="button" @click="goFindPwd">비밀번호 찾기</button>
      </div>

      <div style="margin-top:16px;">
        <button type="button" @click="goSocialSignup">소셜 회원가입</button>
      </div>
    </section>
  </main>
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
});



const login = async () => {
  try {
    await userStore.login(loginUser);
    router.push({ name: "home" });
  } catch (error) {
    console.error("login failed:", error);
  console.error("status:", error?.response?.status);
  console.error("data:", error?.response?.data);
    if (error.response?.status === 401) {
      alert('올바른 아이디, 비밀번호를 입력해주세요.'); // 경고창으로 에러 메시지 표시
    }
  }
};

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


<style scoped></style>