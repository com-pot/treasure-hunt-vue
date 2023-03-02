import {ref} from "vue";
import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"
import {UserAuthData} from "@src/modules/Auth/model/AuthModel"

const state = {
    user: ref<UserAuthData | null>(null),
}

let apiAdapter: JsonApiAdapter
const actions = {
    bindApiAdapter(api: JsonApiAdapter) {
        apiAdapter = api
    },

    signUp(login: string, pass: string): Promise<UserAuthData> {
        return apiAdapter.post<UserAuthData>('/auth/account', {login, pass})
            .then(() => (actions.signIn(login, pass)))
    },
    signIn(login: string, pass: string): Promise<UserAuthData> {
        return apiAdapter.post<UserAuthData>('/auth/auth-token', {login, pass})
            .then((userData) => {
                actions._setUserData({login, token: userData.token})
                return userData
            })
    },
    signOut() {
        actions._clearUserData();
        return Promise.resolve()
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
    _setUserData(userData: UserAuthData) {
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
