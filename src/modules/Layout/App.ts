import {computed, defineComponent, h, onMounted, provide, ref, shallowRef, watch} from "vue"
import {RouteLocationMatched, useRoute} from "vue-router"

import authStore from "@src/modules/Auth/authStore";
authStore.actions._initUserData();

import packageData from "../../../package.json"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"
import { createDialogController } from "./components/dialogController";

type componentModule = {
    default: ReturnType<typeof defineComponent>
}
const layoutIndex: Record<string, () => Promise<componentModule>> = {
    default: () => import('@custom/furrworld/FwLayout.vue'),
    print: () => import('./views/PrintLayout.vue'),
    backstage: () => import('@src/modules/treasure-hunt/Backstage/BackstageLayout.vue'),
}

export default defineComponent({
    name: packageData.name,
    props: {
        rootSelector: {type: String, required: true},
    },
    setup(props) {
        const appRootEl = ref(document.querySelector(props.rootSelector) as HTMLDivElement)
        const route = useRoute()
        const layoutName = computed(() => {
            if (!route.matched.length) {
                return ''
            }

            const requiredLayout = inferLayout(route.matched)
            if (!layoutIndex[requiredLayout]) {
                console.warn(`Unknown layout '${requiredLayout}', using default`)
                return 'default'
            }
            return requiredLayout
        })

        const layoutComponent = shallowRef<ReturnType<typeof defineComponent>>(null)

        const theme = computed(() => layoutName.value === 'print' ? undefined : 'theme-fw')

        const dialogController = createDialogController()
        provide("layout:dialogController", dialogController)

        onMounted(function() {
            watch(theme, (theme, prevValue) => {
                prevValue && document.body.classList.remove(prevValue)
                theme && document.body.classList.add(theme)
            }, {immediate: true})
        })

        watch(layoutName, async (name) => {
            appRootEl.value && appRootEl.value.setAttribute('data-layout', name)
            layoutComponent.value = null

            if (!name) {
                return
            }

            const layoutModule = await layoutIndex[name]()
            layoutComponent.value = layoutModule.default
        }, {immediate: true})

        return () => {
            if (!layoutComponent.value) {
                return h(LoadingIndicator, {
                    size: 'full',
                })
            }

            return h(layoutComponent.value)
        }
    },
})

function inferLayout(matched: readonly RouteLocationMatched[]) {

    const iDefiner = matched
        .map((loc, i) => ({loc, i}))
        .reverse()
        .find((record) => record.loc.meta.layout)
    const metaDefiner = matched[iDefiner?.i]
    return  metaDefiner?.meta.layout as string || 'default'
}