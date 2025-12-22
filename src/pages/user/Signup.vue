<!-- src/pages/user/Signup.vue -->
<template>
  <div class="page">
    <div class="signup-card">
      <div class="card-head">
        <h1 class="title">회원가입</h1>
        <p class="subtitle">Newstagram에 오신 것을 환영합니다!</p>
      </div>

      <div class="signup-form">

      
      <!-- 휴대폰 -->
      <div class="input-group">
        <label class="input-label">휴대폰 번호</label>
        <div class="input-row">
        <input
          v-model="form.phoneNumber"
          type="text"
          placeholder="01012345678"
          @blur="onBlurPhone"
          class="custom-input flex-grow"
          :disabled="verifyOk"
        />
        <button
          type="button"
          class="btn-outline"
          @click="onClickRequestCode"
          :disabled="!canRequestCode || verifyOk"
        >
        {{ verifyOk ? '인증완료' : '인증번호 받기' }}
        </button>
        </div>

        <div class="validation-msg" :style="{ color: phoneMsgColor }">
          <span>{{ phoneMsg }}</span>
          <svg v-if="availability.phone === true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#28a745" class="success-icon">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
        </div>

        <!-- 인증 코드 영역 -->
        <div v-if="showCodeArea && !verifyOk" class="verification-box">
        <!-- 개발용 -->
        <!-- <div class="verification-box">  -->
        <!--  -->
          <div class="input-row">
            <input
              v-model="verificationCode"
              type="text"
              placeholder="인증번호 6자리"
              class="custom-input flex-grow"
              maxlength="6"
              inputmode="numeric"
              @input="onlyNumbers"
            />
        
            <button type="button" class="btn-outline" @click="onClickVerifyCode" :disabled="!canVerifyCode">
              확인
            </button>
          </div>
          <div class="validation-msg" :style="{ color: verifyMsgColor }">
            {{ verifyMsg }}
          </div>
          <div class="info-text-box">
            <p>
              인증번호를 발송했습니다. (유효시간 5분)<br />
              인증번호가 오지 않으면 입력하신 정보가 정확한지 확인하여 주세요.<br />
              가상전화번호는 인증번호를 받을 수 없습니다.
            </p>
            <button 
              type="button" 
              class="resend-link" 
              @click="onClickResendCode" :disabled="loading.requestCode"
            >
              코드 재전송
            </button>
          </div>
            
        
          
        </div>
      </div>

      <!-- 이메일 -->
      <div class="input-group">
        <label class="input-label">이메일</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="test@example.com"
          @blur="onBlurEmail"
          class="custom-input"
          autocomplete="email"
          />
        <div class="validation-msg" :style="{ color: emailMsgColor }">
          <span>{{ emailMsg }}</span>
          <svg v-if="availability.email === true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#28a745" class="success-icon">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
        </div>
      </div>
          

      <!-- 닉네임 -->
      <div class="input-group">
        <label class="input-label">닉네임</label>
        <input
          v-model="form.nickname"
          type="text"
          placeholder="닉네임예시"
          @blur="onBlurNickname"
          class="custom-input"
        />
        <div class="validation-msg" :style="{ color: nicknameMsgColor }">
          <span>{{ nicknameMsg }}</span>
          <svg v-if="availability.nickname === true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#28a745" class="success-icon">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
        </div>
      </div>

      
      <!-- 비밀번호 -->
      <div class="input-group">
        <label class="input-label">비밀번호</label>
        <div class="input-wrapper">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="password1234" 
            class="custom-input"
            autocomplete="current-password"
            @blur="onBlurPassword"
            @input="onBlurPassword"
          />
          <button type="button" class="toggle-pwd-btn" @click="togglePassword">
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
        <div class="validation-msg" :style="{ color: passwordMsgColor }">
          <span>{{ passwordMsg }}</span>
          <svg v-if="availability.password === true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#28a745" class="success-icon">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
        </div>
      </div>
    </div>
      <!-- 회원가입 -->
      <button 
        type="button"
        class="btn-signup"
        @click="onClickSignup" :disabled="!canSignup"
      >
        회원가입
      </button>

      <div class="card-footer">
        <span>이미 가입한 계정이 있으신가요?</span>
        <button
          type="button"
          class="link-btn" 
          @click="goLogin" :disabled="loading.signup"
        >
          로그인으로
        </button>
      </div>


      <div v-if="signupMsg" style="margin-top:10px; font-size:12px;" :style="{ color: signupMsgColor }">
        {{ signupMsg }}
      </div>
    
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import UserApi from '@/api/UserApi.js';

const router = useRouter();

// Password Toggle State
const showPassword = ref(false);

const form = ref({
  phoneNumber: '',
  email: '',
  nickname: '',
  password: '',
});

// 중복 체크 상태
const availability = ref({
  phone: null, 
  email: null,
  nickname: null,
  password: null,
});

// 메시지
const phoneMsg = ref('');
const emailMsg = ref('');
const nicknameMsg = ref('');
const passwordMsg = ref('');

const verifyMsg = ref('');
const signupMsg = ref('');

// 색상
const phoneMsgColor = computed(() => (availability.value.phone === false ? '#c00' : '#333'));
const emailMsgColor = computed(() => (availability.value.email === false ? '#c00' : '#333'));
const nicknameMsgColor = computed(() => (availability.value.nickname === false ? '#c00' : '#333'));
const passwordMsgColor = computed(() => (availability.value.password === false ? '#c00' : '#333'));

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

const togglePassword = () => {
  showPassword.value = !showPassword.value;
}

const getAvailable = (res) => {
  return res?.data?.available;
};

const onBlurPhone = async () => {
  const phone = (form.value.phoneNumber || '').trim();
  verifyOk.value = false;
  verifyMsg.value = '';

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
    phoneMsg.value = available ? '가입 가능한 휴대폰 번호입니다.' : '이미 가입된 휴대폰 번호입니다.';
    if (!available) {
      showCodeArea.value = false;
    }
  } catch (e) {
    console.log(e);
    showCodeArea.value = false;

    if (e.response && e.response.status === 400) {
      availability.value.phone = false;
      phoneMsg.value = '잘못된 휴대폰 번호 형식입니다.';
    }
    else{
      availability.value.phone = null;
      phoneMsg.value = '휴대폰 번호 확인 중 오류가 발생했습니다.';
    }
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
    emailMsg.value = available ? '사용 가능한 이메일입니다.' : '이미 가입된 이메일입니다.';
  } catch (e) {
    console.log(e);

    if (e.response && e.response.status === 400) {
      availability.value.email = false;
      emailMsg.value = '잘못된 이메일 형식입니다.';
    } else {
      availability.value.email = null;
      emailMsg.value = '이메일 확인 중 오류가 발생했습니다.';
    }
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

    if (e.response && e.response.status === 400) {
      availability.value.nickname = false;
      nicknameMsg.value = '닉네임 형식이 올바르지 않습니다. (한글, 영문, 숫자 2~50자)';
    } else {
      availability.value.nickname = null;
      nicknameMsg.value = '닉네임 확인 중 오류가 발생했습니다.';
    }
  } finally {
    loading.value.nicknameCheck = false;
  }
};

const onBlurPassword = () => {
  const pw = form.value.password;

  if (!pw) {
    availability.value.password = null;
    passwordMsg.value = '';
    return;
  }

  const isValidChars = /^[a-zA-Z0-9!@#$%]*$/.test(pw);
  
  if (!isValidChars) {
    availability.value.password = false;
    passwordMsg.value = '사용할 수 없는 특수문자가 포함되어 있습니다. (!@#$%만 가능)';
    return;
  }

  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSpecial = /[!@#$%]/.test(pw);

  let count = 0;
  if (hasLetter) count++;
  if (hasDigit) count++;
  if (hasSpecial) count++;

  // 2가지 이상 조합 확인
  if (count >= 2) {
    if (pw.length < 8) {
       availability.value.password = false;
       passwordMsg.value = '비밀번호는 최소 8자 이상이어야 합니다.';
    } else {
       availability.value.password = true;
       passwordMsg.value = '사용 가능한 비밀번호입니다.';
    }
  } else {
    availability.value.password = false;
    passwordMsg.value = '영문, 숫자, 특수문자(!@#$%) 중 2가지 이상을 조합해주세요.';
  }
};

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
  if (!phone || !code){
    verifyMsg.value = '휴대폰 번호와 인증 코드를 입력해주세요.';
    return;
  }

  loading.value.verifyCode = true;
  verifyOk.value = false;
  verifyMsg.value = '';

  try {
    await UserApi.verifyPhoneCode(phone, code);
    verifyOk.value = true;
    verifyMsg.value = '휴대폰 인증이 완료되었습니다.';
    phoneMsg.value = null;
  } catch (e) {
    console.log(e);
    verifyOk.value = false;

    if (e.response && e.response.status === 400) {
      verifyMsg.value = '인증번호가 일치하지 않거나 만료되었습니다.';
    } else {
      verifyMsg.value = '인증 확인 중 오류가 발생했습니다.';
    }
  } finally {
    loading.value.verifyCode = false;
  }
};

const canSignup = computed(() => {
  const phone = (form.value.phoneNumber || '').trim();
  const email = (form.value.email || '').trim();
  const nickname = (form.value.nickname || '').trim();
  const password = (form.value.password || '').trim();

  return (
    !!phone &&
    !!email &&
    !!nickname &&
    !!password &&
    availability.value.phone === true &&
    availability.value.email === true &&
    availability.value.nickname === true &&
    availability.value.password === true &&
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

const onlyNumbers = (event) => {
  // 입력된 값에서 숫자가 아닌 것(0-9가 아닌 것)을 모두 빈 문자열로 치환
  const val = event.target.value.replace(/[^0-9]/g, '');
  verificationCode.value = val;
};

</script>

<style scoped>

.signup-card {
width: 100%;
max-width: 480px;
background: #ffffff;
border-radius: 24px;
padding: 40px;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05);
display: flex;
flex-direction: column;
text-align: center;
}


/* Header */
.card-header {
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #111;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
}

  /* Form Layout */
.signup-form {
display: flex;
flex-direction: column;
gap: 10px;
}

/* Inputs  */
.input-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 라벨 왼쪽 정렬 강제 */
  width: 100%;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px; /* 인풋과의 간격 */
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-row {
  display: flex;
  width: 100%;
  gap: 8px;
}

.flex-grow {
  flex: 1;
  width: auto; /* width 100% 해제 */
}

.custom-input {
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  font-size: 15px;
  color: #111;
  background-color: #fff;
  transition: all 0.2s ease;
  outline: none;
}

.custom-input::placeholder {
  color: #ccc;
}

.custom-input:focus {
  border-color: #111; 
  box-shadow: 0 0 0 1px #111;
}

.custom-input:disabled {
  background-color: #F5F5F5;
  color: #999;
  cursor: not-allowed;
  border-color: #EEE;
}

.pwd-input {
  padding-right: 60px;
}

.toggle-pwd-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  cursor:default;
}

.toggle-pwd-btn:hover {
  color: #111;
}

.info-text-box {
  margin-top: 16px;
  text-align: left; /* 강제 좌측 정렬 */
  border-top: 1px solid #eee; /* 구분선 추가 */
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-text-box p {
  font-size: 12px;
  color: #888;
  line-height: 1.6; /* 줄간격 확보 */
  margin: 0;
}

.resend-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  color: #111;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  align-self: flex-start; /* 왼쪽 정렬 */
  margin-top: 4px;
}

/* Validation Message */
.validation-msg {
  width: 100%;
  /* 오른쪽 정렬을 위해 flex-end 사용 */
  display: flex;
  justify-content: flex-end; 
  align-items: center; /* 수직 중앙 정렬 */
  gap: 4px; /* 텍스트와 아이콘 사이 간격 */
  
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
  min-height: 16px; /* 아이콘 크기 고려하여 약간 키움 */
}
.validation-msg.center {
  justify-content: center;
}
.success-icon {
  flex-shrink: 0; /* 아이콘이 찌그러지지 않게 */
}

/* Verification Code Area */
.verification-box {
  width: 100%;
  margin-top: 12px;
  background-color: #FAFAFA;
  border: 1px solid #EEEEEE;
  border-radius: 12px;
  padding: 16px;
}

.verify-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

/* Buttons */
.btn-signup {
  background: #111827;
  color: #fff;
  border-color: #111827;
  height: 48px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 40px;
  margin-bottom: 20px;
}

.btn-outline {
  height: 52px;
  padding: 0 16px;
  background: #fff;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  color: #111;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap; /* 줄바꿈 방지 */
  flex-shrink: 0; /* 버튼이 찌그러지지 않게 */
  transition: all 0.2s;
}

.btn-outline:disabled {
  background-color: #F5F5F5;
  color: #CCC;
  border-color: #EEE;
  cursor: not-allowed;
}

/* Footer */
.card-footer {
  font-size: 14px;
  color: #666;
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-weight: 700;
  color: #111;
  cursor: pointer;
  margin-left: 4px;
}

.link-btn:hover {
  text-decoration: underline;
}

</style>
