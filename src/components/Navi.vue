<template>
    <footer>
        <nav>
            <button @click="goHome">
                <span>메인</span>
            </button>
            <button @click="goMy">
                <span>내꺼</span>
            </button>
            <button @click="goMake">
                <span>프롬프트꺼</span>
            </button>
        </nav>
    </footer>
</template>

<script setup>
import { useRouter} from 'vue-router';

const router = useRouter();

// 라우터 이동
const goHome = () => {
    router.push({ name: 'home' });
};
const goMy = () => {
    router.push({ name: 'my' });
};
const goMake = () => {
    router.push({ name: 'prompt' });
};
</script>

<style scoped></style>
