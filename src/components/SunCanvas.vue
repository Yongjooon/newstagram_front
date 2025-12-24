<template>
  <div class="sunlight-bg"></div>
  <canvas ref="canvas" class="sun-canvas"></canvas>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

const canvas = ref(null);
let ctx;
let W, H;
let particles = [];
const particleCount = 50; // 입자 개수 약간 증가
let angle = 0;
let animationFrameId;

function resizeCanvas() {
  W = canvas.value.width = window.innerWidth;
  H = canvas.value.height = window.innerHeight;
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    const size = Math.random() * 8 + 4; // 크기 (4~12)
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: size,
      // ✅ 타입: 세모 or 네모 랜덤
      type: Math.random() > 0.5 ? "triangle" : "square",
      // ✅ 색상: 더 진한 금색, 주황색, 흰색 계열
      color:
        Math.random() > 0.3
          ? `rgba(255, 180, 60, ${Math.random() * 0.4 + 0.4})` // 진한 금색 (투명도 0.4~0.8)
          : `rgba(255, 255, 220, ${Math.random() * 0.4 + 0.4})`, // 밝은 상아색
      speedY: Math.random() * 0.8 + 0.3, // 떨어지는 속도
      speedX: Math.random() * 0.4 - 0.2, // 좌우 표류 속도
      // ✅ 회전 속성 추가
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5, // 회전 속도 및 방향
    });
  }
}

function update() {
  angle += 0.01;

  for (let i = 0; i < particleCount; i++) {
    const p = particles[i];

    // 움직임 업데이트
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(angle + i) * 0.2; // 약간의 파동 추가
    p.rotation += p.rotationSpeed; // 회전

    // 화면 밖으로 나가면 재진입
    if (p.y > H + p.size || p.x > W + p.size || p.x < -p.size) {
      p.y = -p.size;
      p.x = Math.random() * W;
      // 재진입 시 속성 약간 변동 (자연스럽게)
      p.speedY = Math.random() * 0.8 + 0.3;
    }
  }
}

// ✅ 모양 그리기 함수 분리
function drawParticle(p) {
  ctx.save(); // 현재 캔버스 상태 저장
  ctx.translate(p.x, p.y); // 입자 위치로 중심점 이동
  ctx.rotate((p.rotation * Math.PI) / 180); // 회전 적용
  ctx.fillStyle = p.color;
  ctx.beginPath();

  if (p.type === "square") {
    // 네모 그리기 (중심 기준)
    ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
  } else {
    // 세모 그리기 (중심 기준 정삼각형 근사)
    const h = p.size * (Math.sqrt(3) / 2); // 높이
    ctx.moveTo(0, -h / 2); // 상단 꼭짓점
    ctx.lineTo(-p.size / 2, h / 2); // 좌하단
    ctx.lineTo(p.size / 2, h / 2); // 우하단
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore(); // 캔버스 상태 복구
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // 빛이 섞이는 효과 유지 (선명한 색상끼리 겹치면 더 빛남)
  ctx.globalCompositeOperation = "screen";

  for (const p of particles) {
    drawParticle(p);
  }

  update();
  animationFrameId = requestAnimationFrame(draw);
}

onMounted(() => {
  ctx = canvas.value.getContext("2d");
  resizeCanvas();
  initParticles();
  draw();

  window.addEventListener("resize", resizeCanvas);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener("resize", resizeCanvas);
});
</script>

<style scoped>
.sun-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
}

/* ===== SUNNY BACKGROUND (더 진하게) ===== */
.sunlight-bg {
  position: fixed;
  inset: 0;
  z-index: -2;
  /* 배경도 조금 더 진하고 따뜻한 톤으로 변경 */
  background: linear-gradient(
    160deg,
    #ffeeda 0%,
    /* 따뜻한 살구색 */ #fff8e8 50%,
    /* 밝은 크림색 */ #eef6fc 100% /* 연한 하늘색 */
  );
  overflow: hidden;
}

.sunlight-bg::before {
  content: "";
  position: absolute;
  top: -60%;
  left: -40%;
  width: 200%;
  height: 200%;
  /* 광원도 더 강하게 */
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 200, 100, 0.3),
    /* 진한 금빛 */ transparent 50%
  );
  animation: sunBreath 8s ease-in-out infinite alternate;
}

@keyframes sunBreath {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.15);
    opacity: 1;
  }
}
</style>
