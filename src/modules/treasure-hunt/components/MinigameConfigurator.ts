import {defineComponent, h, reactive, shallowRef, watch} from "vue"
import {loadMinigameConfigurator} from "@src/modules/treasure-hunt/utils/minigameUtils"
import useAsyncIndicator from "@src/modules/Layout/mixins/useAsyncIndicator"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"

export default defineComponent({
    props: {
        challengeType: {type: String, required: true},
        challengeConfig: {type: Object},
    },

    setup(props, {emit, attrs}) {
        const asyncIndicator = useAsyncIndicator()

        const configuration = reactive({
            component: shallowRef(),
        })

        function loadConfigurator(minigame: string) {
            emit('expose-configuration-fn', null)

            const configuratorLoad = loadMinigameConfigurator(minigame)
                .then((component) => configuration.component = component)

            return asyncIndicator.awaitTask(configuratorLoad)
        }

        watch(() => props.challengeType, loadConfigurator, {immediate: true})


        return () => {
            if (asyncIndicator.status !== 'ready') {
                return h(LoadingIndicator)
            }
            if (!configuration.component) {
                return h('pre', JSON.stringify(props.challengeConfig, undefined, 2))
            }

            return h(configuration.component, {
                challengeConfig: props.challengeConfig,
                ...attrs,
            })
        }
    },
})
