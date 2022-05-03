import {RouteRecordRaw} from "vue-router";

import Authorization from "@src/modules/Auth/views/Authorization.vue";
import PlayerViewEntrypoint from "./views/PlayerViewEntrypoint.vue";
import GameView from "./views/GameView.vue";
import ThLanding from "@src/modules/treasure-hunt/views/ThLanding.vue";
import Page404 from "@src/modules/Layout/views/Page404.vue"
import PassThroughComponent from "@src/routing/PassThroughComponent"

import gameStatic from "@custom/vlm/vlmGame.static.json"
// import gameStatic from "@custom/sotw/sotwGame.static.json"

const gameRoutes: RouteRecordRaw[] = [
    {
        name: 'th.NodeView',
        path: 'part/:nodeId',
        component: PlayerViewEntrypoint,
        props(match) {
            return {nodeId: match.params.nodeId, mode: 'story'}
        },
    },
    {
        name: 'th.NodeView.challenge',
        path: 'part/:nodeId/challenge',
        component: PlayerViewEntrypoint,
        props(match) {
            return {nodeId: match.params.nodeId, mode: 'challenge'}
        },
    },

    {
        name: 'th.ClueReveal',
        path: '/clue',
        component: () => import("./views/ClueReveal.vue"),
        props: (match) => ({
            clueKey: match.query.key,
        }),
    },
];

const routes: RouteRecordRaw[] = [
    {
        name: 'th.Game',
        path: '/game',
        component: GameView,
        children: gameRoutes,
    },
    {
        path: '/',
        name: 'Landing.welcome',
        component: ThLanding,
        props: {
            gameStatic: gameStatic,
        },
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
        component: PassThroughComponent,
        meta: {
            layout: 'backstage',
        },
        redirect: {name: 'Backstage.SeasonDashboard'},
        children: [
            {
                path: '',
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
                name: 'Backstage.ClueEditor',
                path: 'clue-editor',
                component: () => import('./Backstage/components/ClueEditorView.vue'),
                props(match) {
                    return {activeClue: match.query.clue}
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
                component: () => import("src/modules/treasure-hunt/Backstage/views/MinigameSandbox.vue"),
                props: true,
            },
        ],
    },

    {
        path: '/:path(.+)',
        name: 'Page.Error.404',
        component: Page404,
        meta: {
            title: "Stránka nenalezena",
        },
    },
]


export default routes;
