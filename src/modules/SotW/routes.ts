import {RouteRecordRaw} from "vue-router";

import Authorization from "@/modules/Auth/views/Authorization.vue";
import SotwView from "./views/SotwView.vue";
import GameView from "./views/GameView.vue";
import Landing from "./views/Landing.vue";

const gameRoutes: RouteRecordRaw[] = [
    {
        name: 'sotw.NodeView',
        path: 'part/:nodeId',
        component: SotwView,
        props: true,
    },
];

const routes: RouteRecordRaw[] = [
    {
        name: 'sotw.Game',
        path: '/game',
        component: GameView,
        children: gameRoutes,
    },
    {
        path: '/',
        name: 'Landing.welcome',
        component: Landing,
    },
    {
        path: '/auth/:formId',
        name: 'Authorization',
        component: Authorization,
        props: true,
    },
]


export default routes;
