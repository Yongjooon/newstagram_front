<!-- src/pages/mypage/Mypage.vue -->
<template>
  <main style="padding:16px; max-width:720px;">
    <h1 style="margin:0 0 12px;">My Page</h1>

    <!-- 로딩/에러 -->
    <div v-if="loadingInfo" style="padding:12px 0;">불러오는 중...</div>
    <div v-else-if="infoError" style="padding:12px 0; color:#c00;">
      {{ infoError }}
    </div>

    <!-- 내 정보 -->
    <section
      v-if="!loadingInfo && myInfo"
      style="border:1px solid #ddd; border-radius:10px; padding:12px; margin-bottom:16px;"
    >
      <h2 style="margin:0 0 10px;">회원정보</h2>

      <div style="display:flex; flex-direction:column; gap:6px; font-size:14px;">
        <div><b>이메일</b>: {{ myInfo.email ?? '-' }}</div>
        <div><b>닉네임</b>: {{ myInfo.nickname ?? '-' }}</div>
        <div><b>권한</b>: {{ renderRole(myInfo.role) }}</div>
      </div>

      <div style="margin-top:10px;">
        <button type="button" @click="reloadInfo" :disabled="loadingInfo">
          새로고침
        </button>
      </div>
    </section>

    <!-- 닉네임 변경 -->
    <section style="border:1px solid #ddd; border-radius:10px; padding:12px; margin-bottom:16px;">
      <h2 style="margin:0 0 10px;">닉네임 변경</h2>

      <div style="display:flex; gap:8px; align-items:center;">
        <input
          v-model="newNickname"
          type="text"
          placeholder="새닉네임예시"
          @blur="onBlurNickname"
          style="flex:1; padding:10px; border:1px solid #ddd; border-radius:8px;"
        />
        <button
          type="button"
          @click="onChangeNickname"
          :disabled="!canChangeNickname"
        >
          닉네임 변경
        </button>
      </div>

      <div style="margin-top:6px; font-size:12px;" :style="{ color: nicknameCheckMsgColor }">
        {{ nicknameCheckMsg }}
      </div>

    </section>

    <!-- 비밀번호 변경 -->
    <section style="border:1px solid #ddd; border-radius:10px; padding:12px;">
      <h2 style="margin:0 0 10px;">비밀번호 변경</h2>

      <div style="display:flex; flex-direction:column; gap:10px;">
        <div>
          <label style="display:block; margin-bottom:6px;">현재 비밀번호</label>
          <input
            v-model="currentPassword"
            type="password"
            placeholder="현재 비밀번호"
            style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"
          />
        </div>

        <div>
          <label style="display:block; margin-bottom:6px;">새 비밀번호</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="새 비밀번호"
            style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"
          />
          <div style="margin-top:6px; font-size:12px;" :style="{ color: passwordRuleColor }">
            {{ passwordRuleMsg }}
          </div>
        </div>

        <div style="display:flex; gap:8px;">
          <button type="button" @click="onChangePassword" :disabled="!canChangePassword">
            비밀번호 변경
          </button>
          <button type="button" @click="clearPwInputs" :disabled="loadingPw">
            입력 초기화
          </button>
        </div>

        <div v-if="pwMsg" style="font-size:12px;" :style="{ color: pwMsgColor }">
          {{ pwMsg }}
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import MypageApi from '../../api/MypageApi';
import UserApi from '../../api/UserApi';

const myInfo = ref(null);

const loadingInfo = ref(false);
const infoError = ref('');

// 닉네임 변경/중복체크
const newNickname = ref('');
const loadingNickname = ref(false);
const nicknameOk = ref(false);
const nicknameMsg = ref('');

const nicknameAvailable = ref(null); 
const loadingNicknameCheck = ref(false);
const nicknameCheckMsg = ref('');
const nicknameCheckMsgColor = computed(() => {
  if (nicknameAvailable.value === true) return '#333';
  if (nicknameAvailable.value === false) return '#c00';
  return '#666';
});
const nicknameMsgColor = computed(() => (nicknameOk.value ? '#333' : '#c00'));

// 비밀번호 변경
const currentPassword = ref('');
const newPassword = ref('');
const loadingPw = ref(false);
const pwOk = ref(false);
const pwMsg = ref('');
const pwMsgColor = computed(() => (pwOk.value ? '#333' : '#c00'));


const getAvailable = (res) => {
  // res = { success, code, message, data: { available }, error }
  if (res?.success !== true) return undefined;
  return res?.data?.available;
};


const renderRole = (role) => {
  if (!role) return '-';
  return String(role);
};

const reloadInfo = async () => {
  loadingInfo.value = true;
  infoError.value = '';

  try {
    const data = await MypageApi.getMyInfo();
    myInfo.value = data?.data ? data.data : data;

    
    if (myInfo.value?.nickname) {
      newNickname.value = myInfo.value.nickname;
      nicknameAvailable.value = null;
      nicknameCheckMsg.value = '';
    }
  } catch (e) {
    console.log(e);
    infoError.value = '회원정보 조회 중 오류가 발생했습니다. (로그인 상태를 확인하세요.)';
    myInfo.value = null;
  } finally {
    loadingInfo.value = false;
  }
};


const onBlurNickname = async () => {
  const nn = (newNickname.value || '').trim();

  if (!nn) {
    nicknameAvailable.value = null;
    nicknameCheckMsg.value = '';
    return;
  }

  if (myInfo.value?.nickname && nn === myInfo.value.nickname) {
    nicknameAvailable.value = true;
    nicknameCheckMsg.value = '현재 사용 중인 닉네임입니다.';
    return;
  }

  loadingNicknameCheck.value = true;
  nicknameCheckMsg.value = '닉네임 확인 중...';
  nicknameAvailable.value = null;

  try {
    const res = await UserApi.nicknameDuplicateCheck(nn);
    const available = getAvailable(res);

    if (available === true) {
      nicknameAvailable.value = true;
      nicknameCheckMsg.value = '사용 가능한 닉네임입니다.';
    } else if (available === false) {
      nicknameAvailable.value = false;
      nicknameCheckMsg.value = '이미 사용 중인 닉네임입니다.';
    } else {
      nicknameAvailable.value = null;
      nicknameCheckMsg.value = '닉네임 확인에 실패했습니다.';
    }
  } catch (e) {
    console.log(e);
    nicknameAvailable.value = null;
    nicknameCheckMsg.value = '닉네임 확인 중 오류가 발생했습니다.';
  } finally {
    loadingNicknameCheck.value = false;
  }
};

const canChangeNickname = computed(() => {
  const nn = (newNickname.value || '').trim();
  if (!nn) return false;
  if (loadingNickname.value || loadingNicknameCheck.value) return false;

  return nicknameAvailable.value === true;
});

const onChangeNickname = async () => {
  const nn = (newNickname.value || '').trim();
  if (!nn) return;

  loadingNickname.value = true;
  nicknameOk.value = false;
  nicknameMsg.value = '';

  try {
    await MypageApi.changeNickName(nn);
    nicknameOk.value = true;
    nicknameMsg.value = '닉네임이 변경되었습니다.';
    await reloadInfo();
  } catch (e) {
    console.log(e);
    nicknameOk.value = false;
    nicknameMsg.value = '닉네임 변경 중 오류가 발생했습니다.';
  } finally {
    loadingNickname.value = false;
  }
};


const passwordValid = computed(() => {
  const pw = (newPassword.value || '').trim();
  if (pw.length < 8) return false;

  const hasLetter = /[A-Za-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw); 

  return hasLetter && hasNumber && hasSpecial;
});

const passwordRuleMsg = computed(() => {
  const pw = (newPassword.value || '').trim();
  if (!pw) return '비밀번호 규칙: 8자 이상, 영문/숫자/특수문자 포함';
  return passwordValid.value
    ? '비밀번호 규칙을 만족합니다.'
    : '8자 이상, 영문/숫자/특수문자를 모두 포함해야 합니다.';
});

const passwordRuleColor = computed(() => {
  const pw = (newPassword.value || '').trim();
  if (!pw) return '#666';
  return passwordValid.value ? '#333' : '#c00';
});

const canChangePassword = computed(() => {
  const cp = (currentPassword.value || '').trim();
  const np = (newPassword.value || '').trim();
  return !!cp && !!np && passwordValid.value && !loadingPw.value;
});

const clearPwInputs = () => {
  currentPassword.value = '';
  newPassword.value = '';
  pwMsg.value = '';
  pwOk.value = false;
};

const onChangePassword = async () => {
  const cp = (currentPassword.value || '').trim();
  const np = (newPassword.value || '').trim();
  if (!cp || !np) return;
  if (!passwordValid.value) return;

  loadingPw.value = true;
  pwOk.value = false;
  pwMsg.value = '';

  try {
    await MypageApi.changePW(cp, np);
    pwOk.value = true;
    pwMsg.value = '비밀번호가 변경되었습니다.';
    clearPwInputs();
  } catch (e) {
    console.log(e);
    pwOk.value = false;
    pwMsg.value = '비밀번호 변경 중 오류가 발생했습니다.';
  } finally {
    loadingPw.value = false;
  }
};

onMounted(async () => {
  await reloadInfo();
});
</script>

<style scoped>
  main {
  padding: 16px;
  max-width: 720px;
}

h1 {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text);
}

/* 공통 섹션 카드(회원정보/닉네임/비번) */
section[style*="border:1px solid #ddd"][style*="border-radius:10px"][style*="padding:12px"] {
  background: var(--panel);
  border: 1px solid var(--line) !important;
  border-radius: var(--radius) !important;
  box-shadow: var(--shadow);
}

/* 제목 */
h2 {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: var(--text);
}

/* input 개선 */
input {
  border: 1px solid var(--line) !important;
  border-radius: 12px !important;
  padding: 10px 12px !important;
  outline: none;
}

input:focus {
  box-shadow: var(--focus);
  border-color: rgba(59, 130, 246, 0.7) !important;
}

/* 버튼 */
button {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
}

button:hover {
  background: #fafafa;
  border-color: #d1d5db;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 에러 메세지 */
div[style*="color:#c00"] {
  color: #b91c1c !important;
}

</style>
