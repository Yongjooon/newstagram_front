<!-- src/components/Footer.vue -->
<template>
  <footer class="footer">
    Footer입니다.
  </footer>
</template>

<script setup></script>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  background: rgba(246, 247, 251, 0.9);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  color: var(--muted);
  font-size: 13px;
}
</style>
