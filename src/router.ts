import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import MinigamesIndexComponent from "@/minigames/MinigamesIndexComponent.vue";

let routes: RouteRecordRaw[] = [
    {
        path: "/minigames/understand",
        name: "minigames.understand",
        component: () => import("@/minigames/Understand/UnderstandComponent.vue"),
    },
    {
        path: "/minigames/anagram",
        name: "minigames.anagram",
        component: () => import("@/minigames/Anagram/AnagramComponent.vue"),
    },
    {
        path: "/minigames/domino",
        name: "minigames.domino",
        component: () => import("@/minigames/CircularDomino/CircularDominoComponent.vue"),
    },
    {
        path: "/minigames/switcheroo",
        name: "minigames.toggleMatrix",
        component: () => import("@/minigames/ToggleMatrix/ToggleMatrixComponent.vue"),
    },
    {
        path: "/minigames/sitting-shamans",
        name: "minigames.sittingShamans",
        component: () => import("@/minigames/ZebraFoal/ZebraFoalComponent.vue"),
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
