<template>
  <main class="page-container">
    <section class="feed-card-layout">
      <header class="feed-header">
        <div class="folder-tab">
          <h2 class="desktop-label">👤 회원정보 관리</h2>
        </div>
      </header>

      <div class="feed-body glass-panel-body">
        <div v-if="loadingInfo" class="status-msg">
          회원정보를 불러오는 중...
        </div>
        <div v-else-if="infoError" class="status-msg error">
          {{ infoError }}
        </div>

        <div v-else-if="myInfo" class="content-wrapper">
          <section class="info-section">
            <h3 class="section-title">기본 정보</h3>

            <div class="info-grid">
              <div class="info-item">
                <span class="label">이메일</span>
                <div class="value-wrapper">
                  <span class="value-text">{{ myInfo.email ?? "-" }}</span>
                  <span v-if="isAdmin" class="badge-admin">ADMIN</span>
                </div>
              </div>

              <div class="info-item">
                <span class="label">닉네임</span>
                <div class="value-wrapper">
                  <span v-if="!editingNickname" class="value-text highlight">
                    {{ myInfo.nickname ?? "-" }}
                  </span>

                  <div v-else class="edit-mode-group">
                    <input
                      v-model="newNickname"
                      type="text"
                      placeholder="새 닉네임"
                      @blur="onBlurNickname"
                      class="input-dark"
                    />
                  </div>
                </div>
              </div>

              <div v-if="editingNickname || nicknameMsg" class="msg-row">
                <span class="spacer"></span>
                <div class="msg-content">
                  <p
                    v-if="editingNickname"
                    class="hint-text"
                    :style="{ color: nicknameCheckMsgColor }"
                  >
                    {{ nicknameCheckMsg }}
                  </p>
                  <p
                    v-if="nicknameMsg"
                    class="hint-text"
                    :style="{ color: nicknameMsgColor }"
                  >
                    {{ nicknameMsg }}
                  </p>
                </div>
              </div>
            </div>

            <div class="action-row">
              <button
                v-if="!editingNickname"
                type="button"
                class="btn-glass"
                @click="startEditNickname"
              >
                닉네임 수정
              </button>

              <template v-else>
                <button
                  type="button"
                  class="btn-glass primary"
                  @click="onChangeNickname"
                  :disabled="!canChangeNickname"
                >
                  저장
                </button>
                <button
                  type="button"
                  class="btn-glass"
                  @click="cancelEditNickname"
                  :disabled="loadingNickname"
                >
                  취소
                </button>
              </template>
            </div>
          </section>

          <hr class="divider" />

          <section class="info-section">
            <div class="section-header">
              <h3 class="section-title">보안 설정</h3>
              <button
                type="button"
                class="btn-glass small"
                @click="togglePasswordPanel"
              >
                {{ showPasswordPanel ? "닫기" : "비밀번호 변경" }}
              </button>
            </div>

            <transition name="slide-fade">
              <div v-if="showPasswordPanel" class="password-panel">
                <div class="input-group">
                  <label>현재 비밀번호</label>
                  <input
                    v-model="currentPassword"
                    type="password"
                    placeholder="현재 사용 중인 비밀번호"
                    class="input-dark"
                  />
                </div>

                <div class="input-group">
                  <label>새 비밀번호</label>
                  <input
                    v-model="newPassword"
                    type="password"
                    placeholder="8자 이상 (영문/숫자/특수문자)"
                    class="input-dark"
                  />
                  <p class="hint-text" :style="{ color: passwordRuleColor }">
                    {{ passwordRuleMsg }}
                  </p>
                </div>

                <div class="action-row left-align">
                  <button
                    type="button"
                    class="btn-glass primary"
                    @click="onChangePassword"
                    :disabled="!canChangePassword"
                  >
                    변경하기
                  </button>
                  <button
                    type="button"
                    class="btn-glass"
                    @click="clearPwInputs"
                    :disabled="loadingPw"
                  >
                    초기화
                  </button>
                </div>

                <p
                  v-if="pwMsg"
                  class="hint-text main-msg"
                  :style="{ color: pwMsgColor }"
                >
                  {{ pwMsg }}
                </p>
              </div>
            </transition>
          </section>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import MypageApi from "../../api/MypageApi";
import UserApi from "../../api/UserApi";

const myInfo = ref(null);
const loadingInfo = ref(false);
const infoError = ref("");

// 닉네임 관련 상태
const editingNickname = ref(false);
const newNickname = ref("");
const loadingNickname = ref(false);
const nicknameOk = ref(false);
const nicknameMsg = ref("");

const nicknameAvailable = ref(null);
const loadingNicknameCheck = ref(false);
const nicknameCheckMsg = ref("");
const nicknameCheckMsgColor = computed(() => {
  if (nicknameAvailable.value === true) return "#4ade80"; // Green
  if (nicknameAvailable.value === false) return "#f87171"; // Red
  return "#9ca3af"; // Gray
});
const nicknameMsgColor = computed(() =>
  nicknameOk.value ? "#4ade80" : "#f87171"
);

// 비밀번호 관련 상태
const showPasswordPanel = ref(false);
const currentPassword = ref("");
const newPassword = ref("");
const loadingPw = ref(false);
const pwOk = ref(false);
const pwMsg = ref("");
const pwMsgColor = computed(() => (pwOk.value ? "#4ade80" : "#f87171"));

const getAvailable = (res) => {
  if (res?.success !== true) return undefined;
  return res?.data?.available;
};

// ADMIN 뱃지
const isAdmin = computed(() => {
  const role = myInfo.value?.role ?? "";
  return String(role).toUpperCase() === "ADMIN";
});

const reloadInfo = async () => {
  loadingInfo.value = true;
  infoError.value = "";

  try {
    const data = await MypageApi.getMyInfo();
    myInfo.value = data?.data ? data.data : data;

    if (myInfo.value?.nickname) {
      newNickname.value = myInfo.value.nickname;
    }

    nicknameAvailable.value = null;
    nicknameCheckMsg.value = "";
    nicknameMsg.value = "";
    nicknameOk.value = false;
  } catch (e) {
    console.log(e);
    infoError.value = "회원정보 조회 중 오류가 발생했습니다.";
    myInfo.value = null;
  } finally {
    loadingInfo.value = false;
  }
};

/* 닉네임 수정 */
const startEditNickname = () => {
  editingNickname.value = true;
  nicknameMsg.value = "";
  nicknameOk.value = false;
  newNickname.value = (myInfo.value?.nickname || "").toString();
  nicknameAvailable.value = null;
  nicknameCheckMsg.value = "";
};

const cancelEditNickname = () => {
  editingNickname.value = false;
  nicknameAvailable.value = null;
  nicknameCheckMsg.value = "";
  nicknameMsg.value = "";
  nicknameOk.value = false;
  newNickname.value = (myInfo.value?.nickname || "").toString();
};

const onBlurNickname = async () => {
  if (!editingNickname.value) return;
  const nn = (newNickname.value || "").trim();

  if (!nn) {
    nicknameAvailable.value = null;
    nicknameCheckMsg.value = "";
    return;
  }

  if (myInfo.value?.nickname && nn === myInfo.value.nickname) {
    nicknameAvailable.value = true;
    nicknameCheckMsg.value = "현재 사용 중인 닉네임입니다.";
    return;
  }

  loadingNicknameCheck.value = true;
  nicknameCheckMsg.value = "닉네임 확인 중...";
  nicknameAvailable.value = null;

  try {
    const res = await UserApi.nicknameDuplicateCheck(nn);
    const available = getAvailable(res);

    if (available === true) {
      nicknameAvailable.value = true;
      nicknameCheckMsg.value = "사용 가능한 닉네임입니다.";
    } else if (available === false) {
      nicknameAvailable.value = false;
      nicknameCheckMsg.value = "이미 사용 중인 닉네임입니다.";
    } else {
      nicknameAvailable.value = null;
      nicknameCheckMsg.value = "닉네임 확인에 실패했습니다.";
    }
  } catch (e) {
    console.log(e);
    nicknameAvailable.value = null;
    nicknameCheckMsg.value = "닉네임 확인 중 오류가 발생했습니다.";
  } finally {
    loadingNicknameCheck.value = false;
  }
};

const canChangeNickname = computed(() => {
  if (!editingNickname.value) return false;
  const nn = (newNickname.value || "").trim();
  if (!nn) return false;
  if (loadingNickname.value || loadingNicknameCheck.value) return false;
  return nicknameAvailable.value === true;
});

const onChangeNickname = async () => {
  const nn = (newNickname.value || "").trim();
  if (!nn) return;

  loadingNickname.value = true;
  nicknameOk.value = false;
  nicknameMsg.value = "";

  try {
    await MypageApi.changeNickName(nn);
    nicknameOk.value = true;
    nicknameMsg.value = "닉네임이 변경되었습니다.";
    alert("닉네임이 변경되었습니다.");
    await reloadInfo();
    editingNickname.value = false;
  } catch (e) {
    console.log(e);
    nicknameOk.value = false;
    nicknameMsg.value = "닉네임 변경 중 오류가 발생했습니다.";
    alert("닉네임 변경 중 오류가 발생했습니다.");
  } finally {
    loadingNickname.value = false;
  }
};

/* 비밀번호 패널 */
const togglePasswordPanel = () => {
  showPasswordPanel.value = !showPasswordPanel.value;
  if (!showPasswordPanel.value) {
    clearPwInputs();
  }
};

const passwordValid = computed(() => {
  const pw = (newPassword.value || "").trim();
  if (pw.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  return hasLetter && hasNumber && hasSpecial;
});

const passwordRuleMsg = computed(() => {
  const pw = (newPassword.value || "").trim();
  if (!pw) return "8자 이상, 영문/숫자/특수문자 포함";
  return passwordValid.value
    ? "사용 가능한 비밀번호입니다."
    : "규칙에 맞지 않습니다.";
});

const passwordRuleColor = computed(() => {
  const pw = (newPassword.value || "").trim();
  if (!pw) return "#6b7280";
  return passwordValid.value ? "#4ade80" : "#f87171";
});

const canChangePassword = computed(() => {
  const cp = (currentPassword.value || "").trim();
  const np = (newPassword.value || "").trim();
  return !!cp && !!np && passwordValid.value && !loadingPw.value;
});

const clearPwInputs = () => {
  currentPassword.value = "";
  newPassword.value = "";
  pwMsg.value = "";
  pwOk.value = false;
};

const onChangePassword = async () => {
  const cp = (currentPassword.value || "").trim();
  const np = (newPassword.value || "").trim();
  if (!cp || !np || !passwordValid.value) return;

  loadingPw.value = true;
  pwOk.value = false;
  pwMsg.value = "";

  try {
    await MypageApi.changePW(cp, np);
    pwOk.value = true;
    pwMsg.value = "비밀번호가 변경되었습니다.";
    alert("비밀번호가 변경되었습니다.");
    clearPwInputs();
    showPasswordPanel.value = false;
  } catch (e) {
    console.log(e);
    pwOk.value = false;
    pwMsg.value = "비밀번호 변경 중 오류가 발생했습니다.";
    alert("비밀번호 변경 중 오류가 발생했습니다.");
  } finally {
    loadingPw.value = false;
  }
};

onMounted(async () => {
  await reloadInfo();
});
</script>

<style scoped>
.page-container {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
  padding-top: 10px;
}

.feed-card-layout {
  width: 100%;
  height: 100%;
  max-width: 800px; /* 너무 넓어지지 않게 제한 */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: visible;
}

/* ✅ 헤더 (폴더 탭) */
.feed-header {
  display: flex;
  align-items: flex-end;
  height: 50px;
  flex-shrink: 0;
  position: relative;
  z-index: 5;
}

.folder-tab {
  background-color: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  border-radius: 16px 16px 0 0;

  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 100%;
  min-width: 200px;
  position: relative;
  top: 1px;
}

.desktop-label {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;
}

/* ✅ 본문 (유리 패널) */
.feed-body.glass-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 40px;

  background-color: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 24px 24px 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  z-index: 4;
}

/* ✅ 내부 콘텐츠 스타일 */
.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  border-left: 4px solid #72d6f5;
  padding-left: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  width: 100px;
  color: #9ca3af;
  font-weight: 600;
  font-size: 14px;
}

.value-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.value-text {
  color: #e5e7eb;
  font-size: 15px;
}

.value-text.highlight {
  font-weight: 700;
  color: #fff;
}

.badge-admin {
  background: linear-gradient(135deg, #ff9a9e 0%, #ff6b6b 100%);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.input-dark {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 10px 14px;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  transition: all 0.2s;
}

.input-dark:focus {
  border-color: #72d6f5;
  background: rgba(0, 0, 0, 0.5);
}

.edit-mode-group {
  flex: 1;
  max-width: 300px;
}

/* 메시지 영역 */
.msg-row {
  display: flex;
  margin-top: -10px;
}
.spacer {
  width: 100px; /* 라벨 너비와 동일 */
}
.msg-content {
  flex: 1;
}
.hint-text {
  font-size: 13px;
  margin: 4px 0 0 0;
}

/* 액션 버튼 영역 */
.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
.action-row.left-align {
  justify-content: flex-start;
}

/* 유리 버튼 스타일 */
.btn-glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ccc;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-glass:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-glass.primary {
  background: rgba(114, 214, 245, 0.15);
  border-color: rgba(114, 214, 245, 0.4);
  color: #72d6f5;
}

.btn-glass.primary:hover:not(:disabled) {
  background: rgba(114, 214, 245, 0.3);
  color: #fff;
}

.btn-glass:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-glass.small {
  padding: 4px 10px;
  font-size: 12px;
}

/* 구분선 */
.divider {
  border: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 10px 0;
}

/* 비밀번호 패널 애니메이션 */
.password-panel {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: #9ca3af;
  font-size: 13px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* 스크롤바 */
.feed-body::-webkit-scrollbar {
  width: 6px;
}
.feed-body::-webkit-scrollbar-track {
  background: transparent;
}
.feed-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* 로딩/에러 */
.status-msg {
  text-align: center;
  color: #999;
  padding: 40px;
}
.status-msg.error {
  color: #f87171;
}

/* 모바일 반응형 */
@media (max-width: 900px) {
  .page-container {
    padding: 12px;
  }

  .feed-body.glass-panel-body {
    padding: 20px;
  }

  .folder-tab {
    min-width: 0;
  }

  /* 모바일에서 라벨/값 줄바꿈 */
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .label {
    width: auto;
    font-size: 12px;
  }

  .spacer {
    display: none;
  }

  .edit-mode-group {
    max-width: 100%;
    width: 100%;
  }
}
</style>
