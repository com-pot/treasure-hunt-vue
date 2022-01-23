import {computed} from "vue"
import {RouteLocationNormalizedLoaded} from "vue-router"

export default function useLayoutSkin(route: RouteLocationNormalizedLoaded) {
    return computed(() => {
        let skin = ''
        route.matched.forEach((match) => {
            if (match.meta.skin) {
                skin += (skin ? ' ' : '') + match.meta.skin
            }
        })
        return skin
    })
}
