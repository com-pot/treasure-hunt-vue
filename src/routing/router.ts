import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import minigameRouter from "@/minigames/minigameRouter";

let routes: RouteRecordRaw[] = [
    ...minigameRouter,
    {
        path: '/:path(.*)',
        component: {
            template: "<p>uh oh, '{{$route.params.path}}'</p>"
        },
        meta: {
            title: "Whoops!",
        },
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});


export default router
