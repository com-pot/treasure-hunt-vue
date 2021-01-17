import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import MinigamesIndexComponent from "@/minigames/MinigamesIndexComponent.vue";

let routes: RouteRecordRaw[] = [
    {
        path: "/minigames/understand",
        name: "minigames.understand",
        component: () => import("@/minigames/Understand/UnderstandComponent.vue"),
    },
    {
        path: "/minigames/domino",
        name: "minigames.domino",
        component: () => import("@/minigames/CircularDomino/CircularDominoComponent.vue"),
    },
    {
        path: "/",
        name: "index",
        component: MinigamesIndexComponent,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
