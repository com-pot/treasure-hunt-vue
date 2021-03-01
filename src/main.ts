import { createApp } from 'vue'
import App from '@/modules/Layout/App.vue'
import router from './routing/router'
import {RouteTitle} from "@/routing/types";
import authStore from "@/modules/Auth/authStore";

import "@/sass/main.scss";

authStore.actions._initUserData();

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
