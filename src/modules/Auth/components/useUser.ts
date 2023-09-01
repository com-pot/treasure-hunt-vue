import {computed, reactive} from "vue"
import authStore from "@src/modules/Auth/authStore"
import {UserAuthData} from "@src/modules/Auth/model/AuthModel"

type AuthUser = {
    data: UserAuthData|null,
    readonly initials: string | null,

    actions: {
        signUp(login: string, pass: string): Promise<UserAuthData>,
        signIn(login: string, pass: string): Promise<UserAuthData>,
        signOut(): Promise<void>,
    }
}

const initialsPattern = /[\-\s\.]+/g

export default (): AuthUser => {
    const data = computed(() => authStore.state.user.value)
    const initials = computed(() => {
        const login = data.value?.login
        if (!login) return null

        return login.split(initialsPattern)
            .map((str) => str.substring(0, 1))
            .filter(Boolean)
            .join("")
            .toUpperCase()
    })
    return reactive({
        data,
        initials,

        actions: authStore.actions,
    })
}
