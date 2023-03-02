import {computed, reactive} from "vue"
import authStore from "@src/modules/Auth/authStore"
import {UserAuthData} from "@src/modules/Auth/model/AuthModel"

type AuthUser = {
    data: UserAuthData|null,

    actions: {
        signUp(login: string, pass: string): Promise<UserAuthData>,
        signIn(login: string, pass: string): Promise<UserAuthData>,
        signOut(): Promise<void>,
    }
}

export default (): AuthUser => {
    return reactive({
        data: computed(() => authStore.state.user.value),

        actions: authStore.actions,
    })
}
