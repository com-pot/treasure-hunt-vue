import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Page404 from '../modules/Layout/views/Page404.vue'

import thRoutes from "@src/modules/treasure-hunt/routes";



let routes: RouteRecordRaw[] = [
    ...thRoutes,
    {
        path: '/:path(.+)',
        component: Page404,
        meta: {
            title: "Stránka nenaleyena",
        },
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,

    linkActiveClass: "active",
    linkExactActiveClass: "-exact",
});


export default router
