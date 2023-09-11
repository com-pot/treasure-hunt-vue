import {RouteRecordRaw} from "vue-router"

const routes: RouteRecordRaw[] = [
    {
        name: 'Typeful.ModelIndex',
        path: 'typeful/models',
        component: () => import('./views/Backstage/ModelIndex.vue'),
    },
    {
        name: "Typeful.Collection",
        path: "typeful/collection/:id",
        component: () => import("./views/Backstage/TypefulCollection.vue"),
        props: true,
    },
]

export default routes
