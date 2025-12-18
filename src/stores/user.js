import {ref, computed} from 'vue';
import {defineStore} from 'pinia';
import UserApi from "../api/UserApi";

const initState={
    token:'',
    refreshToken:'',
    user:{
        userId:''
    }
};

export const useUserStore=defineStore('user', () => {
    const state=ref({...initState});

    const isLogin=computed(()=>state.value.user.userId);

    const id=computed(()=>state.value.user.userId);


    const login=async(loginUser)=>{
        try{
            const res=await UserApi.login(loginUser);
            // 토큰이 없거나 에러 메시지인 경우 에러 처리
            if (typeof res.data.accessToken !== 'string' || !res.data.accessToken.startsWith('Bearer')) {
                throw new Error('올바른 아이디 또는 비밀번호를 입력하세요.'); // 에러 메시지 던지기
            }
            state.value.token = res.data.accessToken;
            state.value.refreshToken = res.data.refreshToken;
            state.value.user.userId = loginUser.email;

            localStorage.setItem('user', JSON.stringify(state.value));
        }catch(error){
            throw error;  // 에러를 호출한 쪽으로 다시 던지기
        }
        
    };

    const socialLigin=async(data)=>{
        try{
            state.value.token = data.token;
            state.value.user.userId = data.uerId;
            localStorage.setItem('user', JSON.stringify(state.value));
        }catch(error){
            throw error;  // 에러를 호출한 쪽으로 다시 던지기
        }
    };

    const logout=()=>{
        localStorage.clear();
        state.value={...initState};
        console.log(state)
    };

    const getToken=()=>state.value.token;
    const getRefreshToken = ()=> state.value.refreshToken;

    const setToken = (token)=>{
        state.value.token = token;
        localStorage.setItem('user', JSON.stringify(state.value));
    }

    const load=()=>{
        const user=localStorage.getItem('user');
        if(user != null){
            state.value=JSON.parse(user);
            //console.log(state.value);
        }
    };

    load();

    return{state, id, isLogin, login, socialLigin, logout, getToken, setToken, getRefreshToken, load};
});