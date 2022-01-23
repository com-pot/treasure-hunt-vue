import { createApp } from 'vue'
import App from '@/modules/Layout/App'
import router from './routing/router'
import authStore from "@/modules/Auth/authStore";

import "@/sass/main.scss";

authStore.actions._initUserData();

const rootSelector = '#treasure-hunt-app'
createApp(App, {rootSelector})
    .use(router)
    .use(require("./routing/titleRouting").default, {router})
    .use(require('@/modules/Typeful').plugin)
    .mount(rootSelector);
