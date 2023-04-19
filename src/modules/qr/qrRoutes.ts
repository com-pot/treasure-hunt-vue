import { RouteRecordRaw } from "vue-router";

// import qrData from "@custom/vlm/qrData";
import qrData from "@custom/furrworld/qrData";

export const qrRoutes: RouteRecordRaw[] = [
    {
        name: 'Backstage.Hack.Clues',
        path: 'clues',
        meta: {
            layout: 'print',
        },

        component: () => import('./views/QrDoc.vue'),
        props: (match) => ({
            clueData: qrData,
            viewMode: match.query.mode,
            cutBorder: match.query.cutBorder !== 'false',
        }),
    },
]