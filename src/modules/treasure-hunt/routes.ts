import {RouteRecordRaw} from "vue-router";

import Authorization from "@src/modules/Auth/views/Authorization.vue";
import PlayerViewEntrypoint from "./views/PlayerViewEntrypoint.vue";
import GameView from "./views/GameView.vue";
import Landing from "@src/../custom/sotw/Landing.vue";
import Page404 from "@src/modules/Layout/views/Page404.vue"
import BackstageLayout from "./Backstage/BackstageLayout.vue"

const gameRoutes: RouteRecordRaw[] = [
    {
        name: 'sotw.NodeView',
        path: 'part/:nodeId',
        component: PlayerViewEntrypoint,
        props(match) {
            return {nodeId: match.params.nodeId, mode: 'story'}
        },
    },
    {
        name: 'sotw.NodeView.challenge',
        path: 'part/:nodeId/challenge',
        component: PlayerViewEntrypoint,
        props(match) {
            return {nodeId: match.params.nodeId, mode: 'challenge'}
        },
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
        meta: {
            skin: 'entrance',
        },
    },
    {
        path: '/auth/:formId',
        name: 'Authorization',
        component: Authorization,
        props: true,
        meta: {
            skin: 'entrance',
        },
    },

    {
        path: '/backstage',
        name: "Backstage.root",
        component: BackstageLayout,
        redirect: {name: 'Backstage.SeasonDashboard'},
        children: [
            {
                path: '/',
                name: 'Backstage.SeasonDashboard',
                component: () => import('./Backstage/views/SeasonDashboard.vue'),
            },
            {
                path: 'players',
                name: 'Backstage.Players',
                component: () => import("./Backstage/views/PlayersOverview.vue"),
            },
            {
                path: 'challenges',
                name: 'Backstage.Challenges',
                component: () => import('./Backstage/views/ChallengeStats.vue'),
            },
            {
                path: 'story-editor',
                name: 'Backstage.StoryEditor',
                component: () => import('./Backstage/views/StoryEditor.vue'),
                props(match) {
                    return {activePart: match.query.part}
                },
            },
            {
                path: "minigames",
                name: "minigame.dev.index",
                component: () => import("./Backstage/views/MinigamesIndex.vue"),
                meta: {
                    title: "Dev - Minigames List",
                },
            },
            {
                path: "minigame/:minigame",
                name: 'minigame.dev.detail',
                component: () => import("./Backstage/views/MinigameContainer.vue"),
                props: true,
            },
            {
                path: '/:path(.+)',
                component: Page404,
                meta: {
                    title: "Stránka nenaleyena",
                },
            },
        ],
    },
]


export default routes;
