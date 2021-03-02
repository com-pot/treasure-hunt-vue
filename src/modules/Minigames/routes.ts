import {LocationAsRelativeRaw, RouteLocationMatched, RouteRecordRaw} from "vue-router";

import MinigamesIndexComponent from "./views/MinigamesIndex.vue";
import MinigameContainer from "./views/MinigameContainer.vue";

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
    {caption: "Totems", to: {name: 'minigame.dev.mixMatch'}},
    {caption: "Domino", to: {name: 'minigame.dev.domino'}},
    {caption: "Drums", to: {name: 'minigame.dev.drums'}},
];

const debugRoutes: RouteRecordRaw[] = [
    {
        path: "/dev/minigames",
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
                component: () => import("./components/Understand/UnderstandComponent.vue"),
            },
            {
                path: "bpc",
                name: "minigame.dev.bpc",
                component: () => import("./components/Bpc/BpcComponent.vue"),
                props() {
                    return {
                        minigameData: {
                            inputs: [
                                {name: 'sticks', caption: "Tyčky"},
                                {name: 'diamonds', caption: "Diamanty"},
                            ],
                            check: '5de53d',
                        },
                    };
                },
            },
            {
                path: "anagram",
                name: "minigame.dev.anagram",
                component: () => import("./components/Anagram/AnagramComponent.vue"),
                props() {
                    return {minigameData: {inputText: 'nag a ram'}};
                },
            },
            {
                path: "domino",
                name: "minigame.dev.domino",
                component: () => import("./components/CircularDomino/CircularDominoComponent.vue"),
            },
            {
                path: "mix-match",
                name: "minigame.dev.mixMatch",
                component: () => import("./components/MixMatch/MixMatchComponent.vue"),
            },
            {
                path: "switcheroo",
                name: "minigame.dev.toggleMatrix",
                component: () => import("./components/ToggleMatrix/ToggleMatrixComponent.vue"),
            },
            {
                path: "sitting-shamans",
                name: "minigame.dev.sittingShamans",
                component: () => import("./components/ZebraFoal/ZebraFoalComponent.vue"),
            },
            {
                path: "drums",
                name: "minigame.dev.drums",
                component: () => import("./components/Drums/DrumsComponent.vue"),
            },
        ],
    },
];

export {
    debugRoutes,
}
