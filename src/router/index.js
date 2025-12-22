import { createRouter, createWebHistory } from "vue-router";

import homeRoutes from './home';
import myRoutes from './my';
import mypageRoutes from './mypage';
import promptRoutes from './prompt';
import userRoutes from './user';
import surveyRoutes from './survey';
import budongRoutes from './budong'

import { useUserStore } from "@/stores/user";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
    {
        path: '/',
        redirect: '/user'
    },
    ...homeRoutes,
    ...myRoutes,
    ...mypageRoutes,
    ...promptRoutes,
    ...userRoutes,
    ...surveyRoutes,
    ...budongRoutes,
    ]
});

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    userStore.load();

    if (to.path === '/user' && userStore.isLogin) {
        return next({ name: 'home' }); 
    }

    return next();
});

export default router;
