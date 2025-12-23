<!-- src/pages/mypage/Mypage.vue -->
<template>
  <main class="mypage">
    <!-- 로딩/에러 -->
    <div v-if="loadingInfo" class="state">불러오는 중...</div>
    <div v-else-if="infoError" class="state state--error">
      {{ infoError }}
    </div>

    <!-- 내 정보 -->
    <section v-if="!loadingInfo && myInfo" class="card">
      <h2 class="card__title">회원정보</h2>

      <div class="info">
        <div class="info__row">
          <div class="info__label">이메일</div>
          <div class="info__value">
            <span>{{ myInfo.email ?? "-" }}</span>

            <!-- ✅ ADMIN 뱃지 -->
            <span v-if="isAdmin" class="badge-admin">ADMIN</span>
          </div>
        </div>

        <div class="info__row">
          <div class="info__label">닉네임</div>
          <div class="info__value">
            <!-- 보기 모드 -->
            <span v-if="!editingNickname">{{ myInfo.nickname ?? "-" }}</span>

            <!-- ✅ 수정 모드 -->
            <input
              v-else
              v-model="newNickname"
              type="text"
              placeholder="새 닉네임"
              @blur="onBlurNickname"
              class="input"
            />
          </div>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="actions">
        <!-- 닉네임 수정 -->
        <button
          v-if="!editingNickname"
          type="button"
          @click="startEditNickname"
        >
          닉네임 수정
        </button>

        <template v-else>
          <button
            type="button"
            class="btn-primary"
            @click="onChangeNickname"
            :disabled="!canChangeNickname"
          >
            저장
          </button>
          <button type="button" @click="cancelEditNickname" :disabled="loadingNickname">
            취소
          </button>
        </template>

        <!-- 비밀번호 변경 -->
        <button
          type="button"
          class="btn-ghost"
          @click="togglePasswordPanel"
        >
          {{ showPasswordPanel ? "비밀번호 변경 닫기" : "비밀번호 변경" }}
        </button>

      </div>

      <!-- 닉네임 상태 메시지 -->
      <div v-if="editingNickname" class="hint" :style="{ color: nicknameCheckMsgColor }">
        {{ nicknameCheckMsg }}
      </div>
      <div v-if="nicknameMsg" class="hint" :style="{ color: nicknameMsgColor }">
        {{ nicknameMsg }}
      </div>
    </section>

    <!-- ✅ 비밀번호 변경 패널 (버튼 눌렀을 때만) -->
    <section v-if="!loadingInfo && myInfo && showPasswordPanel" class="card">
      <h2 class="card__title">비밀번호 변경</h2>

      <div class="form">
        <div class="field">
          <label>현재 비밀번호</label>
          <input
            v-model="currentPassword"
            type="password"
            placeholder="현재 비밀번호"
            class="input"
          />
        </div>

        <div class="field">
          <label>새 비밀번호</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="새 비밀번호"
            class="input"
          />
          <div class="hint" :style="{ color: passwordRuleColor }">
            {{ passwordRuleMsg }}
          </div>
        </div>

        <div class="actions">
          <button
            type="button"
            class="btn-primary"
            @click="onChangePassword"
            :disabled="!canChangePassword"
          >
            비밀번호 변경
          </button>
          <button type="button" @click="clearPwInputs" :disabled="loadingPw">
            입력 초기화
          </button>
        </div>

        <div v-if="pwMsg" class="hint" :style="{ color: pwMsgColor }">
          {{ pwMsg }}
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

// ✅ 닉네임 편집 모드 토글
const editingNickname = ref(false);

// 닉네임 변경/중복체크
const newNickname = ref("");
const loadingNickname = ref(false);
const nicknameOk = ref(false);
const nicknameMsg = ref("");

const nicknameAvailable = ref(null);
const loadingNicknameCheck = ref(false);
const nicknameCheckMsg = ref("");
const nicknameCheckMsgColor = computed(() => {
  if (nicknameAvailable.value === true) return "#333";
  if (nicknameAvailable.value === false) return "#c00";
  return "#666";
});
const nicknameMsgColor = computed(() => (nicknameOk.value ? "#333" : "#c00"));

// ✅ 비밀번호 패널 토글
const showPasswordPanel = ref(false);

// 비밀번호 변경
const currentPassword = ref("");
const newPassword = ref("");
const loadingPw = ref(false);
const pwOk = ref(false);
const pwMsg = ref("");
const pwMsgColor = computed(() => (pwOk.value ? "#333" : "#c00"));

const getAvailable = (res) => {
  // res = { success, code, message, data: { available }, error }
  if (res?.success !== true) return undefined;
  return res?.data?.available;
};

const renderRole = (role) => {
  if (!role) return "-";
  return String(role);
};

// ✅ ADMIN 뱃지 조건
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

    // 초기 닉네임 세팅
    if (myInfo.value?.nickname) {
      newNickname.value = myInfo.value.nickname;
    }

    // 상태 초기화
    nicknameAvailable.value = null;
    nicknameCheckMsg.value = "";
    nicknameMsg.value = "";
    nicknameOk.value = false;
  } catch (e) {
    console.log(e);
    infoError.value =
      "회원정보 조회 중 오류가 발생했습니다. (로그인 상태를 확인하세요.)";
    myInfo.value = null;
  } finally {
    loadingInfo.value = false;
  }
};

/* ✅ 닉네임 수정 모드 시작/취소 */
const startEditNickname = () => {
  editingNickname.value = true;
  nicknameMsg.value = "";
  nicknameOk.value = false;

  // 현재 닉네임을 입력칸에 채움
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

  // 입력값 원복
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

    await reloadInfo();
    editingNickname.value = false; // ✅ 저장 후 보기모드로
  } catch (e) {
    console.log(e);
    nicknameOk.value = false;
    nicknameMsg.value = "닉네임 변경 중 오류가 발생했습니다.";
  } finally {
    loadingNickname.value = false;
  }
};

/* ✅ 비밀번호 패널 토글 */
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
  if (!pw) return "비밀번호 규칙: 8자 이상, 영문/숫자/특수문자 포함";
  return passwordValid.value
    ? "비밀번호 규칙을 만족합니다."
    : "8자 이상, 영문/숫자/특수문자를 모두 포함해야 합니다.";
});

const passwordRuleColor = computed(() => {
  const pw = (newPassword.value || "").trim();
  if (!pw) return "#666";
  return passwordValid.value ? "#333" : "#c00";
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
  if (!cp || !np) return;
  if (!passwordValid.value) return;

  loadingPw.value = true;
  pwOk.value = false;
  pwMsg.value = "";

  try {
    await MypageApi.changePW(cp, np);
    pwOk.value = true;
    pwMsg.value = "비밀번호가 변경되었습니다.";
    clearPwInputs();
    showPasswordPanel.value = false; // ✅ 완료 후 닫기(원치 않으면 제거)
  } catch (e) {
    console.log(e);
    pwOk.value = false;
    pwMsg.value = "비밀번호 변경 중 오류가 발생했습니다.";
  } finally {
    loadingPw.value = false;
  }
};

onMounted(async () => {
  await reloadInfo();
});
</script>

<style scoped>
.mypage {
  padding: 16px;
  max-width: 720px;
}

.state {
  padding: 12px 0;
  color: var(--text);
}

.state--error {
  color: #b91c1c;
}

.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
  margin-bottom: 16px;
}

.card__title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: var(--text);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
}

.info__row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.info__label {
  width: 84px;
  color: var(--muted);
  font-weight: 800;
}

.info__value {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.badge-admin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  border: 1px solid #111827;
  background: #111827;
  color: #fff;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field label {
  display: block;
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 6px;
}

.input {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  background: #fff;
  color: var(--text);
  outline: none;
}

.input:focus {
  box-shadow: var(--focus);
  border-color: rgba(59, 130, 246, 0.7);
}

.hint {
  margin-top: 8px;
  font-size: 12px;
}
</style>
