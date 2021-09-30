import {RouteRecordRaw, RouterView} from "vue-router";

import Authorization from "@/modules/Auth/views/Authorization.vue";
import SotwView from "./views/SotwView.vue";
import GameView from "./views/GameView.vue";
import Landing from "./views/Landing.vue";
import Page404 from "@/modules/Layout/views/Page404.vue"
import BackstagePlayers from "@/modules/SotW/views/BackstagePlayers.vue"
import BackstageChallenges from "@/modules/SotW/views/BackstageChallenges.vue"

const gameRoutes: RouteRecordRaw[] = [
    {
        name: 'sotw.NodeView',
        path: 'part/:nodeId',
        component: SotwView,
        props(match) {
            return {nodeId: match.params.nodeId, mode: 'story'}
        },
    },
    {
        name: 'sotw.NodeView.challenge',
        path: 'part/:nodeId/challenge',
        component: SotwView,
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
        component: RouterView,
        redirect: {name: 'Backstage.Players'},
        children: [
            {
                path: 'players',
                name: 'Backstage.Players',
                // component: import('@/modules/SotW/views/BackstagePlayers.vue'),
                component: BackstagePlayers,
            },
            {
                path: 'challenges',
                name: 'Backstage.Challenges',
                // component: import('@/modules/SotW/views/BackstageChallenges.vue'),
                component: BackstageChallenges,
            },
            {
                path: 'story-editor',
                name: 'Backstage.StoryEditor',
                component: () => import('@/modules/StoryEditor/StoryEditor.vue'),
                props(match) {
                    return {activePart: match.query.part}
                },
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
