import {defineComponent, h} from "vue"
import contentBlockBase from "./contentBlockTypes/contentBlockBase"


import {ThContentBlockConfig} from "@src/modules/treasure-hunt/model/treasureHuntContentBlocksController"
import { useContentBlockRegistry } from "./contentBlockRegistry"



export default defineComponent({
    inheritAttrs: false,
    props: {
        type: {type: String, required: true},
        modelValue: {type: Object},

        viewMode: contentBlockBase.props.viewMode,
    },
    emits: ['update:model-value'],

    setup(props, {emit, attrs}) {
        const contentBlockRegistry = useContentBlockRegistry()
        return () => {
            const component = contentBlockRegistry.typeToComponent[props.type]?.component
            if (!component) {
                return h('div', {class: 'content-block -invalid-spec'}, `Unknown content block type=${props.type}`)
            }

            return h(component, {
                block: props.modelValue || {},
                'onUpdate:block-data': (blockData: ThContentBlockConfig) => {
                    emit('update:model-value', blockData)
                },
                viewMode: props.viewMode,
                ...attrs,
            })
        }
    },
})
