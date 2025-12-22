import api from './index';

const BASE_URL = '/api';
const headers = {
  'Content-Type': 'multipart/form-data',
};

export default {
  //일반 회원가입
  async signup(user) {
    const { data } = await api.post(
      `${BASE_URL}/users/email`,
      user,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return data;
  },

  // 휴대폰 번호 중복체크
  async phoneDuplicateCheck(phoneNumber) {
    const { data } = await api.post(
      `${BASE_URL}/users/phone-number/availability`,
      { phoneNumber },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  },

// email 중복체크
async emailDuplicateCheck(email) {
    const { data } = await api.post(
      `${BASE_URL}/users/email/availability`,
      { email },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  },

// nickname 중복체크
async nicknameDuplicateCheck(nickname) {
    const { data } = await api.post(
      `${BASE_URL}/users/nickname/availability`,
      { nickname },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  },

  //휴대폰 인증
  async requestPhoneVerification(phoneNumber) {
    const { data } = await api.post(
      `${BASE_URL}/auth/signup/phone-verification/request`,
      { phoneNumber },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data; 
  },

  //휴대폰 코드 인증
  async verifyPhoneCode(phoneNumber, verificationCode) {
    const { data } = await api.post(
      `${BASE_URL}/auth/signup/phone-verification/verify`,
      { phoneNumber, verificationCode },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  },

  // 소셜 회원가입 정보전달
  async socialSignupInfo() {
    const { data } = await api.get(
      `${BASE_URL}/social-signup/info`
    );
    return data;
  },

  // 소셜 회원가입 등록
  async socialSignupRegister(user) {
    const formData = new FormData();
    for (const key in user) {
      formData.append(key, user[key]);
    }

    const { data } = await api.post(
      `${BASE_URL}/social-signup/register`,
      formData,
      { headers }
    );
    return data;
  },

  // 일반 로그인
  async login(user) {
    const { data } = await api.post(
      `${BASE_URL}/auth/login`,
      user,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return data;
  },

  // 소셜 로그인
  async socialLogin(user) {
    const formData = new FormData();
    for (const key in user) {
      formData.append(key, user[key]);
    }

    const { data } = await api.post(
      `${BASE_URL}/social-login`,
      formData,
      { headers }
    );
    return data;
  },

  // 로그아웃
  async logout() {
    const { data } = await api.post(
      `${BASE_URL}/auth/logout`,
      null,
    );
    return data;
  },

  // 이메일 찾기 인증코드
  async sendEmailFindCode(phoneNumber) {
    const { data } = await api.post(
      `${BASE_URL}/auth/email/find/request`,
      { phoneNumber },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(data);
    return data; 
  },

  //이메일 찾기
  async findUserEmail(phoneNumber, verificationCode) {
  const payload = {
    phoneNumber: String(phoneNumber || '').trim(),
    verificationCode: String(verificationCode || '').trim(),
  };

  const { data } = await api.post(
    `${BASE_URL}/auth/email/find/verify`,
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );
  console.log(data);
  return data;
},

//비밀번호 변경 인증 코드 요청
  async sendPasswordResetRequest(email) {
    const payload = { email: String(email || '').trim() };

    const { data } = await api.post(
      `${BASE_URL}/auth/password/reset-request`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  },

  //비밀번호 재설정
  async resetPassword(token, newPassword) {
    const payload = {
      token: String(token || '').trim(),
      newPassword: String(newPassword || ''),
    };

    const { data } = await api.post(
      `${BASE_URL}/auth/password/reset`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  },

//소셜로그인
  getGoogleOAuthStartUrl() {
    return `${BASE_URL}/oauth2/authorization/google`;
  },

};
