import { createApp } from 'vue'
import App from '@src/modules/Layout/App'
import router from './routing/router'

import 'normalize.css';
import "@src/sass/main.scss";
import "@custom/furrworld/fw-theme.scss";

import titleRouting from './routing/titleRouting';
import * as Typeful from './modules/Typeful';
import narrativePlugin from "./modules/treasure-hunt/narrativePlugin"

const rootSelector = '#treasure-hunt-app'
createApp(App, {rootSelector})
    .use(router)
    .use(titleRouting, {appName: 'FurrWorld', router})
    .use(Typeful.plugin)
    .use(narrativePlugin)
    .mount(rootSelector);
