import {computed, defineComponent, h, onMounted, ref, shallowRef, watch} from "vue"
import {useRoute} from "vue-router"

import packageData from "../../../package.json"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"

type componentModule = {
    default: ReturnType<typeof defineComponent>
}
const layoutIndex: Record<string, () => Promise<componentModule>> = {
    default: () => import('@custom/sotw/SotwLayout.vue'),
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

            // console.log(route.matched.map((match) => match.name))
            const metaDefiner = route.matched.find((record) => record.meta.layout)
            const requiredLayout = metaDefiner?.meta.layout as string || 'default'
            if (!layoutIndex[requiredLayout]) {
                console.warn(`Unknown layout '${requiredLayout}', using default`)
                return 'default'
            }
            return requiredLayout
        })

        const layoutComponent = shallowRef<ReturnType<typeof defineComponent>>(null)

        const theme = computed(() => layoutName.value === 'print' ? undefined : 'theme-sotw')

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

