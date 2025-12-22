<template>
  <aside class="sidenav" aria-label="Main navigation">
    <nav class="sidenav__nav">
      <button :class="navBtnClass('home')" type="button" @click="goHome">메인</button>
      <button :class="navBtnClass('my')" type="button" @click="goMy">내꺼</button>
      <button :class="navBtnClass('prompt')" type="button" @click="goMake">프롬프트</button>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const currentName = computed(() => route.name);

const navBtnClass = (name) => {
  const isActive = currentName.value === name;
  return ['sidenav__btn', isActive ? 'is-active' : ''];
};

const goHome = () => router.push({ name: 'home' });
const goMy = () => router.push({ name: 'my' });
const goMake = () => router.push({ name: 'prompt' });
</script>

<style scoped>
.sidenav {
  position: sticky;
  top: 72px;
  align-self: start;
  height: calc(100vh - 88px);
}

.sidenav__nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  font-weight: 700;
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
</style>
