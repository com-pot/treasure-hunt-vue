import {RouteTitle} from "@src/routing/types"
import {RouteLocationNormalized, Router} from "vue-router"

type TitleRoutingOptions = {
    appName: string,
    router: Router
}

export default {
    install(_: any, options: TitleRoutingOptions) {
        options.router.beforeEach((to, from, next) => {
            let title: RouteTitle = to.meta.title as string|((to: RouteLocationNormalized) => string);
            if (typeof title === "function") {
                title = title(to);
            }

            document.title = options.appName + (title ? ' | ' + title : '');
            next();
        })
    },
}
