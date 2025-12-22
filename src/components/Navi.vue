<template>
  <aside class="sidenav" aria-label="Main navigation">
    <nav class="sidenav__nav">
      <!-- 메인 + 하위 -->
      <div class="navgroup">
        <button
          :class="navBtnClass('home')"
          type="button"
          @click="goHome"
        >
          메인
        </button>

        <!-- ✅ 항상 보이도록 조건 제거 -->
        <div class="subnav">
          <button
            type="button"
            :class="subBtnClass(isHomeActivePeriod('REALTIME'))"
            @click="goHomeWithPeriod('REALTIME')"
          >
            실시간 이슈
          </button>
          <button
            type="button"
            :class="subBtnClass(isHomeActivePeriod('DAILY'))"
            @click="goHomeWithPeriod('DAILY')"
          >
            일간 이슈
          </button>
          <button
            type="button"
            :class="subBtnClass(isHomeActivePeriod('WEEKLY'))"
            @click="goHomeWithPeriod('WEEKLY')"
          >
            주간 이슈
          </button>
        </div>
      </div>

      <!-- 내꺼 -->
      <button
        :class="navBtnClass('my')"
        type="button"
        @click="goMy"
      >
        내꺼
      </button>

      <!-- 프롬프트 + 하위 -->
      <div class="navgroup">
        <button
          :class="navBtnClass('prompt')"
          type="button"
          @click="goPrompt"
        >
          프롬프트
        </button>

        <!-- ✅ 항상 보이도록 조건 제거 -->
        <div class="subnav">
          <div v-if="!promptHistory.length" class="subnav__empty">
            검색 기록 없음
          </div>

          <button
            v-for="(q, idx) in promptHistory"
            :key="`${q}-${idx}`"
            type="button"
            class="subnav__btn"
            @click="goPromptWithQuery(q)"
            :title="q"
          >
            {{ q }}
          </button>
        </div>
      </div>

      <!-- 부동산 -->
      <button
        :class="navBtnClass('budong')"
        type="button"
        @click="goBuDongSan"
      >
        부동산
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHomePeriodStore } from '@/stores/homePeriodStore';
import { usePromptStore } from '@/stores/promptStore';

const router = useRouter();
const route = useRoute();

const homePeriodStore = useHomePeriodStore();
const promptStore = usePromptStore();

const currentName = computed(() => route.name);

/* ---------- class helpers ---------- */
const navBtnClass = (name) => {
  const isActive = currentName.value === name;
  return ['sidenav__btn', isActive ? 'is-active' : ''].join(' ');
};

const subBtnClass = (active) => {
  return ['subnav__btn', active ? 'is-sub-active' : ''].join(' ');
};

/* ---------- state helpers ---------- */
const isHomeActivePeriod = (p) =>
  currentName.value === 'home' && homePeriodStore.period === p;

const promptHistory = computed(() => {
  const list = Array.isArray(promptStore.searchHistory)
    ? promptStore.searchHistory
    : [];
  return list.slice(0, 10);
});

/* ---------- navigation ---------- */
const goHome = () => router.push({ name: 'home' });

const goHomeWithPeriod = async (period) => {
  homePeriodStore.setPeriod(period);
  await router.push({ name: 'home' });
};

const goMy = () => router.push({ name: 'my' });

const goPrompt = () => router.push({ name: 'prompt' });

const goPromptWithQuery = async (q) => {
  const keyword = (q || '').trim();
  if (!keyword) return;

  await router.push({
    name: 'prompt',
    query: { q: keyword },
  });
};

const goBuDongSan = () => router.push({ name: 'budong' });
</script>

<style scoped>
.sidenav {
  position: sticky;
  top: 72px;
  align-self: start;
}

.sidenav__nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--panel);
  box-shadow: var(--shadow);
}

.sidenav__btn {
  width: 100%;
  text-align: left;
  border-radius: 12px;
  padding: 10px 12px;
  border: 1px solid transparent;
  background: transparent;
  font-weight: 800;
}

.sidenav__btn:hover {
  background: #fafafa;
  border-color: #e5e7eb;
}

.sidenav__btn.is-active {
  background: #111827;
  border-color: #111827;
  color: #fff;
}

/* 그룹 */
.navgroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 하위 메뉴 (항상 표시) */
.subnav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 10px;
}

/* 하위 버튼 */
.subnav__btn {
  width: 100%;
  text-align: left;
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  background: #fff;
  font-weight: 700;
  font-size: 13px;
}

.subnav__btn:hover {
  background: #fafafa;
  border-color: #d1d5db;
}

.subnav__btn.is-sub-active {
  background: #f3f4f6;
  border-color: #111827;
}

.subnav__empty {
  font-size: 12px;
  color: #6b7280;
  padding: 4px 2px;
}
</style>
