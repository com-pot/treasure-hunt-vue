import {RouteTitle} from "@/routing/types"
import {Router} from "vue-router"

type TitleRoutingOptions = {
    router: Router
}

export default {
    install(_: any, options: TitleRoutingOptions) {
        options.router.beforeEach((to, from, next) => {
            let title: RouteTitle = to.meta.title;
            if (typeof title === "function") {
                title = title(to);
            }

            document.title = 'SotW' + (title ? ' | ' + title : '');
            next();
        })
    },
}
