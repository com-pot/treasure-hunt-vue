import {computed, defineComponent, h} from "vue"
import TypefulInput from "@src/modules/Typeful/components/TypefulInput"

export default defineComponent({
    name: 'TypefulInputPair',
    inheritAttrs: false,

    props: {
        name: {type: String, required: true},
        label: {type: [String, Boolean], default: true},

        pairClass: {type: [String, Array, Boolean], default: undefined},

        inOpts: {type: Object},
    },
    setup(props, {attrs}) {
        const id = computed(() => props.name)

        return () => {
            let pairElements = [
                h('label', {
                    for: id.value,
                }, [props.label || props.name]),
                h(TypefulInput, {
                    ...attrs,

                    inOpts: props.inOpts,
                    name: props.name,
                    id: id.value,
                }),
            ]
            return h('div', {class: ['tf-pair', attrs.class]}, pairElements)
        }
    },
})
