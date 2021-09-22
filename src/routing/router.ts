import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import {debugRoutes as minigamesDebugRoutes} from "@/modules/Minigames/routes";
import sotwRoutes from "@/modules/SotW/routes.ts";


let routes: RouteRecordRaw[] = [
    ...minigamesDebugRoutes,
    ...sotwRoutes,
    {
        path: '/story-editor',
        component: () => import('@/modules/StoryEditor/StoryEditor.vue'),
        props(match) {
            return {activePart: match.query.part}
        },
    },
    {
        path: '/:path(.+)',
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
