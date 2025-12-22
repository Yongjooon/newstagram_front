<template>
  <div class="page">
    <div class="card card--padded">
      <div class="page-head">
        <h1 class="page-title">아이디 찾기</h1>
        <button class="btn-ghost" type="button" @click="goLogin">로그인으로</button>
      </div>

      <form class="form" @submit.prevent="onVerifyCode">
        <div class="field">
          <label>휴대폰 번호</label>
          <input v-model="phoneNumber" type="text" placeholder="01012345678" />
        </div>

        <div class="actions" style="margin-top:0;">
          <button type="button" @click="onSendCode" :disabled="!canSendCode || sending">인증코드 발송</button>
        </div>

        <div v-if="msg" style="font-size:12px;" :style="{ color: msgColor }">{{ msg }}</div>

        <div v-if="showVerifyArea" class="field" style="margin-top: 8px;">
          <label>인증코드</label>
          <input v-model="verificationCode" type="text" placeholder="6자리" />
          <div class="actions" style="margin-top:10px;">
            <button class="btn-primary" type="submit" :disabled="!canVerify || verifying">확인</button>
          </div>
          <div v-if="verifyMsg" style="font-size:12px;" :style="{ color: verifyMsgColor }">{{ verifyMsg }}</div>
        </div>

        <div v-if="foundEmail" class="card" style="margin-top: 12px; border: 1px dashed var(--line); padding: 12px; border-radius: var(--radius);">
          <div class="muted" style="font-size: 13px;">조회된 이메일</div>
          <div style="font-weight: 900; margin-top: 6px;">{{ foundEmail }}</div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { computed, ref } from 'vue';
import UserApi from '../../api/UserApi';

const router = useRouter();

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
  return !!(phoneNumber.value || '').trim();
});

const canVerify = computed(() => {
  return showVerifyArea.value && !!(verificationCode.value || '').trim();
});

const onSendCode = async () => {
  if (!canSendCode.value) return;
  sending.value = true;

  try {
    const res = await UserApi.sendEmailFindCode(phoneNumber.value);
    if (res?.ok === false) {
      msgOk.value = false;
      msg.value = res?.user_message || '인증코드 발송에 실패했습니다.';
      showVerifyArea.value = false;
      return;
    }

    msgOk.value = true;
    msg.value = '인증코드를 발송했습니다.';
    showVerifyArea.value = true;
  } catch (e) {
    console.log(e);
    msgOk.value = false;
    msg.value = '인증코드 발송 중 오류가 발생했습니다.';
    showVerifyArea.value = false;
  } finally {
    sending.value = false;
  }
};

const onVerifyCode = async () => {
  if (!canVerify.value) return;
  verifying.value = true;

  try {
    const res = await UserApi.findUserEmail(
      phoneNumber.value,
      verificationCode.value,
    );

    const email = res?.data?.email || res?.email || '';
    if (!email) {
      verifyOk.value = false;
      verifyMsg.value = '인증번호가 올바르지 않거나 만료되었습니다.';
      foundEmail.value = '';
      return;
    }

    foundEmail.value = email;
    verifyOk.value = true;
    verifyMsg.value = '인증이 완료되었습니다.';
  } catch (e) {
  console.log('status:', e?.response?.status);
  console.log('data:', e?.response?.data);
  console.log('request payload:', {
    phoneNumber: String(phoneNumber.value || '').replace(/\D/g, ''),
    verificationCode: String(verificationCode.value || '').trim(),
  });

  verifyOk.value = false;
  verifyMsg.value =
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    '인증번호가 올바르지 않거나 만료되었습니다.';
  foundEmail.value = '';
}
};

const goLogin = () => router.push({ name: "user" });
</script>

<style scoped>
</style>
