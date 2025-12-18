<!-- src/pages/user/Signup.vue -->
<template>
  <main style="padding:16px; max-width:520px;">
    <h1 style="margin:0 0 12px;">회원가입</h1>

    <!-- 이메일 -->
    <section style="margin-bottom:12px;">
      <label style="display:block; margin-bottom:6px;">이메일</label>
      <input
        v-model="form.email"
        type="email"
        placeholder="test@example.com"
        @blur="onBlurEmail"
        style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"
      />
      <div style="margin-top:6px; font-size:12px;" :style="{ color: emailMsgColor }">
        {{ emailMsg }}
      </div>
    </section>
        

    <!-- 닉네임 -->
    <section style="margin-bottom:12px;">
      <label style="display:block; margin-bottom:6px;">닉네임</label>
      <input
        v-model="form.nickname"
        type="text"
        placeholder="닉네임예시"
        @blur="onBlurNickname"
        style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"
      />
      <div style="margin-top:6px; font-size:12px;" :style="{ color: nicknameMsgColor }">
        {{ nicknameMsg }}
      </div>
    </section>

    <!-- 휴대폰 -->
    <section style="margin-bottom:12px;">
      <label style="display:block; margin-bottom:6px;">휴대폰 번호</label>
      <input
        v-model="form.phoneNumber"
        type="text"
        placeholder="01012345678"
        @blur="onBlurPhone"
        style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"
      />
      <div style="margin-top:6px; font-size:12px;" :style="{ color: phoneMsgColor }">
        {{ phoneMsg }}
      </div>

      <div style="display:flex; gap:8px; margin-top:10px;">
        <button
          type="button"
          @click="onClickRequestCode"
          :disabled="!canRequestCode"
        >
          인증하기
        </button>
      </div>

      <!-- 인증 코드 영역 -->
      <div v-if="showCodeArea" style="margin-top:12px; border:1px solid #eee; border-radius:8px; padding:12px;">
        <label style="display:block; margin-bottom:6px;">인증 코드</label>
        <input
          v-model="verificationCode"
          type="text"
          placeholder="000000"
          style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"
        />

        <div style="display:flex; gap:8px; margin-top:10px;">
          <button type="button" @click="onClickResendCode" :disabled="loading.requestCode">
            코드 재전송
          </button>
          <button type="button" @click="onClickVerifyCode" :disabled="!canVerifyCode">
            인증하기
          </button>
        </div>

        <div style="margin-top:6px; font-size:12px;" :style="{ color: verifyMsgColor }">
          {{ verifyMsg }}
        </div>
      </div>
    </section>



    <!-- 비밀번호 -->
    <section style="margin-bottom:12px;">
      <label style="display:block; margin-bottom:6px;">비밀번호</label>
      <input
        v-model="form.password"
        type="password"
        placeholder="password1234"
        style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"
      />
    </section>

    <!-- 회원가입 -->
    <section style="display:flex; gap:8px; margin-top:16px;">
      <button type="button" @click="onClickSignup" :disabled="!canSignup">
        회원가입
      </button>
      <button type="button" @click="goLogin" :disabled="loading.signup">
        로그인으로
      </button>
    </section>

    <div v-if="signupMsg" style="margin-top:10px; font-size:12px;" :style="{ color: signupMsgColor }">
      {{ signupMsg }}
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import UserApi from '@/api/UserApi.js';

const router = useRouter();

const form = ref({
  phoneNumber: '',
  email: '',
  nickname: '',
  password: '',
});

// 중복 체크 상태
const availability = ref({
  phone: null,    // true/false/null
  email: null,
  nickname: null,
});

// 메시지
const phoneMsg = ref('');
const emailMsg = ref('');
const nicknameMsg = ref('');

const verifyMsg = ref('');
const signupMsg = ref('');

// 색상
const phoneMsgColor = computed(() => (availability.value.phone === false ? '#c00' : '#333'));
const emailMsgColor = computed(() => (availability.value.email === false ? '#c00' : '#333'));
const nicknameMsgColor = computed(() => (availability.value.nickname === false ? '#c00' : '#333'));

const verifyOk = ref(false);
const verifyMsgColor = computed(() => (verifyOk.value ? '#333' : '#c00'));

const signupOk = ref(false);
const signupMsgColor = computed(() => (signupOk.value ? '#333' : '#c00'));

// 인증 관련
const showCodeArea = ref(false);
const verificationCode = ref('');

// 로딩
const loading = ref({
  phoneCheck: false,
  emailCheck: false,
  nicknameCheck: false,
  requestCode: false,
  verifyCode: false,
  signup: false,
});

// --------------------------
// helpers
// --------------------------
const getAvailable = (res) => {
  return res?.data?.available;
};

// --------------------------
// blur handlers: duplicate checks
// --------------------------
const onBlurPhone = async () => {
  const phone = (form.value.phoneNumber || '').trim();
  verifyOk.value = false;
  verifyMsg.value = '';

  // 입력이 비었으면 초기화
  if (!phone) {
    availability.value.phone = null;
    phoneMsg.value = '';
    showCodeArea.value = false;
    return;
  }

  loading.value.phoneCheck = true;
  try {
    const data = await UserApi.phoneDuplicateCheck(phone);
    const available = getAvailable(data);

    availability.value.phone = available;
    phoneMsg.value = available ? '사용 가능한 휴대폰 번호입니다.' : '이미 사용 중인 휴대폰 번호입니다.';
    if (!available) {
      showCodeArea.value = false;
    }
  } catch (e) {
    console.log(e);
    availability.value.phone = null;
    phoneMsg.value = '휴대폰 번호 확인 중 오류가 발생했습니다.';
    showCodeArea.value = false;
  } finally {
    loading.value.phoneCheck = false;
  }
};

const onBlurEmail = async () => {
  const email = (form.value.email || '').trim();
  if (!email) {
    availability.value.email = null;
    emailMsg.value = '';
    return;
  }

  loading.value.emailCheck = true;
  try {
    const data = await UserApi.emailDuplicateCheck(email);
    const available = getAvailable(data);

    availability.value.email = available;
    emailMsg.value = available ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.';
  } catch (e) {
    console.log(e);
    availability.value.email = null;
    emailMsg.value = '이메일 확인 중 오류가 발생했습니다.';
  } finally {
    loading.value.emailCheck = false;
  }
};

const onBlurNickname = async () => {
  const nickname = (form.value.nickname || '').trim();
  if (!nickname) {
    availability.value.nickname = null;
    nicknameMsg.value = '';
    return;
  }

  loading.value.nicknameCheck = true;
  try {
    const data = await UserApi.nicknameDuplicateCheck(nickname);
    const available = getAvailable(data);

    availability.value.nickname = available;
    nicknameMsg.value = available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.';
  } catch (e) {
    console.log(e);
    availability.value.nickname = null;
    nicknameMsg.value = '닉네임 확인 중 오류가 발생했습니다.';
  } finally {
    loading.value.nicknameCheck = false;
  }
};

// --------------------------
// phone verification flow
// --------------------------
const canRequestCode = computed(() => {
  const phone = (form.value.phoneNumber || '').trim();
  return !!phone && availability.value.phone === true && !loading.value.requestCode && !loading.value.phoneCheck;
});

const onClickRequestCode = async () => {
  const phone = (form.value.phoneNumber || '').trim();
  if (!phone) return;

  loading.value.requestCode = true;
  verifyOk.value = false;
  verifyMsg.value = '';

  try {
    await UserApi.requestPhoneVerification(phone);
    showCodeArea.value = true;
    verifyMsg.value = '인증 코드가 전송되었습니다.';
  } catch (e) {
    console.log(e);
    showCodeArea.value = false;
    verifyMsg.value = '인증 코드 전송 중 오류가 발생했습니다.';
  } finally {
    loading.value.requestCode = false;
  }
};

const onClickResendCode = async () => {
  await onClickRequestCode();
};

const canVerifyCode = computed(() => {
  const phone = (form.value.phoneNumber || '').trim();
  const code = (verificationCode.value || '').trim();
  return !!phone && !!code && showCodeArea.value && !loading.value.verifyCode;
});

const onClickVerifyCode = async () => {
  const phone = (form.value.phoneNumber || '').trim();
  const code = (verificationCode.value || '').trim();
  if (!phone || !code) return;

  loading.value.verifyCode = true;
  verifyOk.value = false;
  verifyMsg.value = '';

  try {
    await UserApi.verifyPhoneCode(phone, code);
    verifyOk.value = true;
    verifyMsg.value = '휴대폰 인증이 완료되었습니다.';
  } catch (e) {
    console.log(e);
    verifyOk.value = false;
    verifyMsg.value = '인증 코드가 올바르지 않거나 만료되었습니다.';
  } finally {
    loading.value.verifyCode = false;
  }
};

// --------------------------
// signup
// --------------------------
const canSignup = computed(() => {
  const phone = (form.value.phoneNumber || '').trim();
  const email = (form.value.email || '').trim();
  const nickname = (form.value.nickname || '').trim();
  const password = (form.value.password || '').trim();

  // 휴대폰/이메일/닉네임 중복 체크가 모두 true + 휴대폰 인증 완료
  return (
    !!phone &&
    !!email &&
    !!nickname &&
    !!password &&
    availability.value.phone === true &&
    availability.value.email === true &&
    availability.value.nickname === true &&
    verifyOk.value === true &&
    !loading.value.signup
  );
});

const onClickSignup = async () => {
  signupOk.value = false;
  signupMsg.value = '';
  loading.value.signup = true;

  try {
    await UserApi.signup({
      phoneNumber: (form.value.phoneNumber || '').trim(),
      email: (form.value.email || '').trim(),
      password: (form.value.password || '').trim(),
      nickname: (form.value.nickname || '').trim(),
    });

    signupOk.value = true;
    signupMsg.value = '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.';
    // 간단 딜레이 없이 즉시 이동
    router.push('/user');
  } catch (e) {
    console.log(e);
    signupOk.value = false;
    signupMsg.value = '회원가입 중 오류가 발생했습니다.';
  } finally {
    loading.value.signup = false;
  }
};

const goLogin = () => {
  router.push('/user');
};
</script>

<style scoped></style>
