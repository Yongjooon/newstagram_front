export default[
    {
        path: '/user',
        name: 'user',
        component:()=>import('../pages/user/Login.vue'),
        meta: { hideLayout: true },
    },
    {
        path: '/user/oauth/google',
        name: 'SocialLoginHandler',
        component:()=>import('../pages/user/SocialLoginHandler.vue'),
        meta: { hideLayout: true },
    },
    {
        path:'/user/signup',
        name:'Signup',
        component:()=>import('../pages/user/Signup.vue'),
        meta: { hideLayout: true },
    },
    {
        path:'/user/social-signup',
        name:'SocialSignup',
        component:()=>import('../pages/user/SocialSignup.vue'),
        meta: { hideLayout: true },
    },
    {
        path:'/user/findid',
        name:'FindID',
        component:()=>import('../pages/user/FindID.vue'),
        meta: { hideLayout: true },
    },
    {
        path:'/user/findpwd',
        name:'FindPwd',
        component:()=>import('../pages/user/FindPwd.vue'),
        meta: { hideLayout: true },
    },
    {
        path:'/password-reset',
        name:'PasswordReset',
        component:()=>import('../pages/user/ChangePwd.vue'),
        meta: { hideLayout: true },
    }
];