import {defineComponent, h, PropType} from "vue"
import contentBlockBase from "@src/modules/treasure-hunt/Backstage/components/ClueEditor/contentBlockBase"

import CBText from "./ContentBlock-Text.vue"
import CBChallenge from "./ContentBlock-Challenge.vue"
import {ThContentBlockConfig} from "@src/modules/treasure-hunt/model/treasureHuntContentBlocksController"

const typeToComponent: Record<string, ReturnType<typeof defineComponent>> = {
    text: CBText,
    challenge: CBChallenge,
}

export default defineComponent({
    inheritAttrs: false,
    props: {
        type: {type: String, required: true},
        modelValue: {type: Object},

        viewMode: contentBlockBase.props.viewMode,
    },
    emits: ['update:model-value'],

    setup(props, {emit, attrs}) {
        return () => {
            const component = typeToComponent[props.type]
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
