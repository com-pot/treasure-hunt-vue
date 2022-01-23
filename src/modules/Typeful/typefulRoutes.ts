import {RouteRecordRaw} from "vue-router"

const routes: RouteRecordRaw[] = [
    {
        name: 'Typeful.SchemaIndex',
        path: '/backstage/typeful/schemas',
        component: () => import('./views/Backstage/SchemaIndex.vue'),
    }
]

export default routes
