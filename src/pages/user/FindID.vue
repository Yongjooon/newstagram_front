<!-- src/pages/user/FindID.vue -->
<template>
  <main style="padding:16px; max-width:520px;">
    <h1 style="margin:0 0 12px;">아이디(이메일) 찾기</h1>

    <!-- 휴대폰 입력 -->
    <section style="margin-bottom:12px;">
      <label style="display:block; margin-bottom:6px;">휴대폰 번호</label>
      <input
        v-model="phoneNumber"
        type="text"
        placeholder="01012345678"
        style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"
      />

      <div style="display:flex; gap:8px; margin-top:10px;">
        <button type="button" @click="onSendCode" :disabled="!canSendCode">
          {{ sending ? '전송 중...' : '인증번호 전송' }}
        </button>
        <button type="button" @click="resetAll" :disabled="sending || verifying">
          초기화
        </button>
      </div>

      <div v-if="msg" style="margin-top:8px; font-size:12px;" :style="{ color: msgColor }">
        {{ msg }}
      </div>
    </section>

    <!-- 인증 코드 영역 -->
    <section
      v-if="showVerifyArea"
      style="border:1px solid #eee; border-radius:10px; padding:12px; margin-bottom:12px;"
    >
      <label style="display:block; margin-bottom:6px;">인증 코드</label>
      <input
        v-model="verificationCode"
        type="text"
        placeholder="인증번호 입력"
        style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"
      />

      <div style="display:flex; gap:8px; margin-top:10px;">
        <button type="button" @click="onResendCode" :disabled="sending">
          코드 재전송
        </button>
        <button type="button" @click="onVerifyCode" :disabled="!canVerifyCode">
          {{ verifying ? '확인 중...' : '인증코드 확인' }}
        </button>
      </div>

      <div v-if="verifyMsg" style="margin-top:8px; font-size:12px;" :style="{ color: verifyMsgColor }">
        {{ verifyMsg }}
      </div>
    </section>

    <!-- 결과 -->
    <section v-if="foundEmail" style="border:1px solid #ddd; border-radius:10px; padding:12px;">
      <h2 style="margin:0 0 8px; font-size:16px;">조회 결과</h2>
      <div style="font-size:14px;">
        당신의 이메일은 <b>{{ foundEmail }}</b> 입니다.
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';
import UserApi from '@/api/UserApi.js';

const phoneNumber = ref('');
const verificationCode = ref('');

const showVerifyArea = ref(false);

const sending = ref(false);
const verifying = ref(false);

const msgOk = ref(false);
const msg = ref('');

const verifyOk = ref(false);
const verifyMsg = ref('');

const foundEmail = ref('');

// 메시지 색상
const msgColor = computed(() => (msgOk.value ? '#333' : '#c00'));
const verifyMsgColor = computed(() => (verifyOk.value ? '#333' : '#c00'));

const canSendCode = computed(() => {
  return !!(phoneNumber.value || '').trim() && !sending.value;
});

const canVerifyCode = computed(() => {
  return (
    !!(phoneNumber.value || '').trim() &&
    !!(verificationCode.value || '').trim() &&
    showVerifyArea.value &&
    !verifying.value
  );
});

// 서버 응답이 { success, data: ... } 구조인 경우가 많아서 방어적으로 파싱
const unwrap = (res) => {
  // res가 곧바로 { success, data, ... } 일 수도 있고,
  // 혹은 서버가 {} 만 줄 수도 있음
  if (res && typeof res === 'object' && 'data' in res) return res.data;
  return res;
};

const resetAll = () => {
  phoneNumber.value = '';
  verificationCode.value = '';
  showVerifyArea.value = false;

  msgOk.value = false;
  msg.value = '';
  verifyOk.value = false;
  verifyMsg.value = '';
  foundEmail.value = '';
};

const onSendCode = async () => {
  const phone = (phoneNumber.value || '').trim();
  if (!phone) return;

  sending.value = true;
  msgOk.value = false;
  msg.value = '';
  verifyOk.value = false;
  verifyMsg.value = '';
  foundEmail.value = '';

  try {
    await UserApi.sendEmailFindCode(phone);

    // 보안상 “없는 번호”여도 동일 응답이라고 했으니, 항상 같은 안내
    msgOk.value = true;
    msg.value = '인증번호를 전송했습니다. 문자를 확인해주세요.';
    showVerifyArea.value = true;
  } catch (e) {
    console.log(e);
    msgOk.value = false;
    msg.value = '인증번호 전송 중 오류가 발생했습니다.';
    showVerifyArea.value = false;
  } finally {
    sending.value = false;
  }
};

const onResendCode = async () => {
  await onSendCode();
};

const onVerifyCode = async () => {
  const phone = (phoneNumber.value || '').trim();
  const code = (verificationCode.value || '').trim();
  if (!phone || !code) return;

  verifying.value = true;
  verifyOk.value = false;
  verifyMsg.value = '';
  foundEmail.value = '';

  try {
    const res = await UserApi.findUserEmail(phone, code);

    // 이메일이 어디에 담겨 오는지 서버 구현에 따라 다를 수 있어 방어적으로 처리
    const payload = unwrap(res);

    // 가능한 케이스들:
    // 1) payload = "test@example.com"
    // 2) payload = { email: "test@example.com" }
    // 3) res = { success:true, data:{ email:"..." } }
    let email = '';
    if (typeof payload === 'string') email = payload;
    else if (payload && typeof payload === 'object') {
      email = payload.email || payload.userEmail || '';
    }

    if (!email) {
      // 서버 스키마가 다를 수 있으니 네트워크 response 보고 여기만 맞추면 됨
      throw new Error('email not found in response');
    }

    foundEmail.value = email;
    verifyOk.value = true;
    verifyMsg.value = '인증이 완료되었습니다.';
  } catch (e) {
    console.log(e);
    verifyOk.value = false;
    verifyMsg.value = '인증번호가 올바르지 않거나 만료되었습니다.';
    foundEmail.value = '';
  } finally {
    verifying.value = false;
  }
};
</script>

<style scoped></style>
