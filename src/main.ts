import { createApp } from 'vue'
import App from './App.vue'
import router from './routing/router'
import {RouteTitle} from "@/routing/types";

router.beforeEach((to, from, next) => {
    let title: RouteTitle = to.meta.title;
    if (typeof title === "function") {
        title = title(to);
    }

    document.title = 'SotW' + (title ? ' | ' + title : '');
    next();
});

createApp(App)
    .use(router)
    .mount('#sotw');
