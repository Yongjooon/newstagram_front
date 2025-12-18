<template>
    <header>
        <div>
            <h2 @click="goHome">이것은 헤더입니다.</h2>
            <p @click="handleLogout">로그아웃</p>
            <p @click="goMypage">마이페이지</p>
        </div>
    </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import UserApi from '../api/UserApi';
import { useUserStore } from '../stores/user';
const router = useRouter();
const userStore = useUserStore();



const handleLogout = async () => {
    try {
        await UserApi.logout();
    } catch (e) {
        console.log(e);
    } finally {
        userStore.logout();
        router.push('/user');
    }
};


const goHome = () => {
    router.push({ name: 'home' })
}

const goMypage = () => {
    router.push({ name: 'mypage' })
}

</script>

<style scoped>

</style>