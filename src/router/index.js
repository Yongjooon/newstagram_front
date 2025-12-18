import { createRouter, createWebHistory } from "vue-router";

import homeRoutes from './home';
import myRoutes from './my';
import mypageRoutes from './mypage';
import promptRoutes from './prompt';
import userRoutes from './user';



const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes : [
        {
            path: '/',
            redirect: '/user' // 루트 경로를 /login으로 리다이렉트  => 추후에 로그인 코튼 확인해서 로그인 안되있으면 이동으로 수정해야함
        },
        ...homeRoutes,
        ...myRoutes,
        ...mypageRoutes,
        ...promptRoutes,
        ...userRoutes,
    ]   
})
export default router;