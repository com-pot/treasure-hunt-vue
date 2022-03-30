import {ref} from "vue";
import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"

type UserData = {
    login: string,
    token: string,
}

const state = {
    user: ref<UserData | null>(null),
}

let apiAdapter: JsonApiAdapter
const actions = {
    bindApiAdapter(api: JsonApiAdapter) {
        apiAdapter = api
    },

    signUp(login: string, pass: string) {
        return apiAdapter.post<UserData>('/auth/account', {login, pass})
            .then(() => (actions.signIn(login, pass)))
    },
    signIn(login: string, pass: string) {
        return apiAdapter.post<UserData>('/auth/auth-token', {login, pass})
            .then((userData) => {
                actions._setUserData({login, token: userData.token})
                return userData
            })
    },
    signOut() {
        actions._clearUserData();
    },
    _initUserData() {
        const authDataSerialized = localStorage.getItem('authData')
        let authData;
        if (!authDataSerialized || !(authData = JSON.parse(authDataSerialized))) {
            return
        }
        const {userData} = authData

        if (!userData || !userData.login) {
            console.warn("Invalid values");
            return;
        }

        state.user.value = {
            login: userData.login,
            token: userData.token,
        }
    },
    _setUserData(userData: UserData) {
        state.user.value = userData
        const authDataSerialized = JSON.stringify({userData});
        localStorage.setItem('authData', authDataSerialized)
    },
    _clearUserData() {
        state.user.value = null;
        localStorage.removeItem('authData');
    }
};

export default {
    state,
    actions,
}
