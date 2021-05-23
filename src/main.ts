import { createApp } from 'vue'
import App from '@/modules/Layout/App.vue'
import router from './routing/router'
import authStore from "@/modules/Auth/authStore";

import "@/sass/main.scss";

authStore.actions._initUserData();

createApp(App)
    .use(router)
    .use(require("./routing/titleRouting").default, {router})
    .use(require('@/modules/Typeful').plugin)
    .mount('#sotw');
