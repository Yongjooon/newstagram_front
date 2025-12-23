<template>
  <!-- <div class="aurora"></div> -->
  <canvas ref="canvas" class="snow-canvas"></canvas>
</template>
<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

const canvas = ref(null);
let ctx;
let W, H;
let particles = [];
const mp = 40;
let angle = 0;
let intervalId;

function resizeCanvas() {
  W = canvas.value.width = window.innerWidth;
  H = canvas.value.height = window.innerHeight;
}

function initParticles() {
  particles = [];
  for (let i = 0; i < mp; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 1,
      d: Math.random() * mp,
    });
  }
}

function update() {
  angle += 0.01;

  for (let i = 0; i < mp; i++) {
    const p = particles[i];

    p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
    p.x += Math.sin(angle) * 2;

    if (p.x > W + 5 || p.x < -5 || p.y > H) {
      if (i % 3 > 0) {
        particles[i] = {
          x: Math.random() * W,
          y: -10,
          r: p.r,
          d: p.d,
        };
      } else {
        particles[i] = {
          x: Math.sin(angle) > 0 ? -5 : W + 5,
          y: Math.random() * H,
          r: p.r,
          d: p.d,
        };
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();

  for (const p of particles) {
    ctx.moveTo(p.x, p.y);
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
  }

  ctx.fill();
  update();
}

onMounted(() => {
  ctx = canvas.value.getContext("2d");
  resizeCanvas();
  initParticles();

  intervalId = setInterval(draw, 33); // 🔥 원본과 동일
  window.addEventListener("resize", resizeCanvas);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
  window.removeEventListener("resize", resizeCanvas);
});
</script>

<style scoped>
.snow-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
  pointer-events: none;
}

/* ===== AURORA BACKGROUND ===== */
.aurora {
  position: fixed;
  inset: 0;
  z-index: -2;
  background: #02030a;
  overflow: hidden;
}

/* 오로라 레이어들 */
.aurora::before,
.aurora::after {
  content: "";
  position: absolute;
  width: 160%;
  height: 160%;
  top: -30%;
  left: -30%;
  filter: blur(80px);
  opacity: 0.6;
  mix-blend-mode: screen;
}

/* 초록/청록 오로라 */
.aurora::before {
  background: radial-gradient(
    ellipse at center,
    rgba(80, 255, 200, 0.45),
    rgba(0, 180, 255, 0.25),
    transparent 60%
  );
  animation: auroraMove1 40s ease-in-out infinite;
}

/* 보라/핑크 오로라 */
.aurora::after {
  background: radial-gradient(
    ellipse at center,
    rgba(180, 100, 255, 0.45),
    rgba(255, 80, 200, 0.25),
    transparent 60%
  );
  animation: auroraMove2 55s ease-in-out infinite;
}

/* 어두운 비네팅 */
.aurora::marker {
  content: "";
}

@keyframes auroraMove1 {
  0% {
    transform: translate(-10%, -10%) rotate(0deg);
  }
  50% {
    transform: translate(10%, 5%) rotate(20deg);
  }
  100% {
    transform: translate(-10%, -10%) rotate(0deg);
  }
}

@keyframes auroraMove2 {
  0% {
    transform: translate(10%, 10%) rotate(0deg);
  }
  50% {
    transform: translate(-10%, -5%) rotate(-25deg);
  }
  100% {
    transform: translate(10%, 10%) rotate(0deg);
  }
}
</style>
