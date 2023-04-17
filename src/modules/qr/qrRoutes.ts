import { RouteRecordRaw } from "vue-router";

import qrData from "@custom/vlm/qrData";

export const qrRoutes: RouteRecordRaw[] = [
    {
        name: 'Backstage.Hack.Clues',
        path: 'clues',
        meta: {
            layout: 'print',
        },

        component: () => import('./views/QrDoc.vue'),
        props: (match) => ({
            viewMode: match.query.mode,
            clueData: qrData,
        }),
    },
]