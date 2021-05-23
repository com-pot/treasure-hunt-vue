import {defineComponent, h} from "vue"
import {useInputRegistry} from "@/modules/Typeful/inputs/inputRegistry";


export default defineComponent({
    // inheritAttrs: false,
    props: {
        type: {type: String, default: 'text'},
    },

    setup(props, context) {
        const inputRegistry = useInputRegistry()

        return () => {
            if (inputRegistry.has(props.type)) {
                // FIXME: ts vue whoops
                const component = inputRegistry.get(props.type) as any
                // console.log({component})
                return h(component)
            }

            return h('input', {
                ...context.attrs,
                type: props.type,
            })
        }
    },
})