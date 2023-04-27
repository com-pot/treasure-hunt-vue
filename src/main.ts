import { createApp } from 'vue'
import App from '@src/modules/Layout/App'
import router from './routing/router'
import authStore from "@src/modules/Auth/authStore";

import 'normalize.css';
import "@src/sass/main.scss";
import "@custom/furrworld/fw-theme.scss";

import titleRouting from './routing/titleRouting';
import * as Typeful from './modules/Typeful';
import narrativePlugin from "./modules/treasure-hunt/narrativePlugin"

authStore.actions._initUserData();

const rootSelector = '#treasure-hunt-app'
createApp(App, {rootSelector})
    .use(router)
    .use(titleRouting, {appName: 'Viva la Mexico', router})
    .use(Typeful.plugin)
    .use(narrativePlugin)
    .mount(rootSelector);
