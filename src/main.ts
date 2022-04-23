import { createApp } from 'vue'
import App from '@src/modules/Layout/App'
import router from './routing/router'
import authStore from "@src/modules/Auth/authStore";

import 'normalize.css';
import "@src/sass/main.scss";
import titleRouting from './routing/titleRouting';
import * as Typeful from './modules/Typeful';

authStore.actions._initUserData();

titleRouting

const rootSelector = '#treasure-hunt-app'
createApp(App, {rootSelector})
    .use(router)
    .use(titleRouting, {appName: 'Viva la Mexico', router})
    .use(Typeful.plugin)
    .mount(rootSelector);
