<template>
  <section>
    <div>
      <textarea
        v-model="text"
        rows="8"
        placeholder="여기에 프롬프트를 작성하세요..."
      />
    </div>

    <div>
      <button type="button" @click="onSubmit" :disabled="!text.trim()">
        전송
      </button>
      <button type="button" @click="onClear" :disabled="!text">
        지우기
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["submit"]);

const text = ref("");

function onSubmit() {
  const value = text.value.trim();
  if (!value) return;
  emit("submit", value);
  text.value = "";
}

function onClear() {
  text.value = "";
}
</script>
