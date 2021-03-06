import {ref} from "vue";

type UserData = {
    login: string,
}

const state = {
    user: ref<UserData | null>(null),
    authToken: ref<string | null>(null),
}

const actions = {
    signUp(login: string, password: string) {
        return Promise.resolve({login} as UserData)
            // return serviceContainer.getService<JsonApiAdapter>('apiAdapter')
            //     .post<UserData>('/user', {login, password})
            .then((userData) => {
                actions._setUserData(userData, 'yes')
            })
    },
    signIn(login: string, password: string) {
        return Promise.resolve({login} as UserData)
            // return serviceContainer.getService<JsonApiAdapter>('apiAdapter')
            //     .post<UserData>('/user/login', {login, password})
            .then((userData) => {
                actions._setUserData(userData, 'good')
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
        const {userData, authToken} = authData

        if (!userData || !userData.login) {
            console.warn("Invalid values");
            return;
        }

        state.user.value = {
            login: userData.login,
        }
        state.authToken.value = authToken
    },
    _setUserData(userData: UserData, authToken: string) {
        state.user.value = userData
        state.authToken.value = authToken
        const authDataSerialized = JSON.stringify({userData, authToken});
        localStorage.setItem('authData', authDataSerialized)
    },
    _clearUserData() {
        state.user.value = null;
        state.authToken.value = null;
        localStorage.removeItem('authData');
    }
};

export default {
    state,
    actions,
}
