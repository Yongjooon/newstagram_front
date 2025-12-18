export default[
    {
        path: '/user',
        name: 'user',
        component:()=>import('../pages/user/Login.vue')
    },
    {
        path:'/user/signup',
        name:'Signup',
        component:()=>import('../pages/user/Signup.vue')
    },
    {
        path:'/user/social-signup',
        name:'SocialSignup',
        component:()=>import('../pages/user/SocialSignup.vue')
    },
    {
        path:'/user/findid',
        name:'FindID',
        component:()=>import('../pages/user/FindID.vue')
    },
    {
        path:'/user/findpwd',
        name:'FindPwd',
        component:()=>import('../pages/user/FindPwd.vue')
    }
];