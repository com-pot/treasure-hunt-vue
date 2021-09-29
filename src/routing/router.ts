import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Page404 from '../modules/Layout/views/Page404.vue'

// import {debugRoutes as minigamesDebugRoutes} from "@/modules/Minigames/routes";
import sotwRoutes from "@/modules/SotW/routes.ts";


let routes: RouteRecordRaw[] = [
    // ...minigamesDebugRoutes,
    ...sotwRoutes,
    {
        path: '/:path(.+)',
        component: Page404,
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
