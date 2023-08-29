import {computed, defineComponent, h, watch} from "vue"
import {useModelCollectionController} from "@src/modules/Typeful/components/useModelController"
import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"
import Multiselect from "@vueform/multiselect"
import { getAsyncModelFn, useModelService } from "../../vueUtils"

export default defineComponent({
    inheritAttrs: false,
    props: {
        modelValue: {},
        target: {type: String, required: true},

        perPage: {type: Number, default: 50},
    },
    emits: ['update:selected-item'],

    setup(props, {attrs, emit}) {
        const api = useApiAdapter()
        const modelService = useModelService(api)
        const targetController = useModelCollectionController(modelService, props.target, {
            stringifyTo: '_label',
        })
        const model = getAsyncModelFn(modelService, props.target)
        targetController.load(1, props.perPage)

        const valueProp = computed(() => model.value?.primaryKey)
        const selectedItem = computed(() => {
            const key = valueProp.value
            return key && props.modelValue && targetController.status === 'ready' && targetController.value
                ?.items?.find((item) => props.modelValue === item[key]) || null
        })

        watch(selectedItem, (item) => {
            if (targetController.status === 'ready') {
                emit('update:selected-item', item)
            }
        }, {immediate: true})

        return () => {
            if (targetController.status !== 'ready' || model.status !== 'ready') {
                return h(LoadingIndicator, {layout: 'inline', label: "Načítám položky"})
            }

            return h(Multiselect, {
                ...attrs,
                modelValue: props.modelValue,
                options: targetController.value.items,
                valueProp: valueProp.value,
                label: '_label',
            })
        }
    },
})
