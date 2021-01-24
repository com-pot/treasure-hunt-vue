import {LocationAsRelativeRaw, RouteLocationMatched, RouteRecordRaw} from "vue-router";

import MinigamesIndexComponent from "@/minigames/MinigamesIndexComponent.vue";
import MinigameContainer from "./MinigameContainer.vue";

type MinigameSpec = {
    caption: string,
    to?: LocationAsRelativeRaw,
}

const minigames: MinigameSpec[] = [
    {caption: "Understand", to: {name: 'minigame.dev.understand'}},
    {caption: "TBA"},
    {caption: "BPC", to: {name: 'minigame.dev.bpc'}},
    {caption: "Anagram", to: {name: 'minigame.dev.anagram'}},
    {caption: "TBA"},
    {caption: "Toggle matrix", to: {name: 'minigame.dev.toggleMatrix'}},
    {caption: "Sitting shamans", to: {name: 'minigame.dev.sittingShamans'}},
    {caption: "Totems"},
    {caption: "Domino", to: {name: 'minigame.dev.domino'}},
    {caption: "Drums"},
];

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "minigame.dev.index",
        component: MinigamesIndexComponent,
        props(route) {
            return {
                minigames
            };
        },
        meta: {
            title: "Dev - Minigames List",
        },
    },
    {
        path: "/dev/minigame",
        component: MinigameContainer,
        meta: {
            title(route: RouteLocationMatched) {
                let minigame = minigames.find((item) => item.to && item.to.name === route.name);
                return minigame ? minigame.caption : null;
            },
        },
        children: [
            {
                path: "understand",
                name: "minigame.dev.understand",
                component: () => import("@/minigames/Understand/UnderstandComponent.vue"),
            },
            {
                path: "bpc",
                name: "minigame.dev.bpc",
                component: () => import("@/minigames/Bpc/BpcComponent.vue"),
            },
            {
                path: "anagram",
                name: "minigame.dev.anagram",
                component: () => import("@/minigames/Anagram/AnagramComponent.vue"),
            },
            {
                path: "domino",
                name: "minigame.dev.domino",
                component: () => import("@/minigames/CircularDomino/CircularDominoComponent.vue"),
            },
            {
                path: "switcheroo",
                name: "minigame.dev.toggleMatrix",
                component: () => import("@/minigames/ToggleMatrix/ToggleMatrixComponent.vue"),
            },
            {
                path: "sitting-shamans",
                name: "minigame.dev.sittingShamans",
                component: () => import("@/minigames/ZebraFoal/ZebraFoalComponent.vue"),
            },
        ],
    },
];

export default routes;
