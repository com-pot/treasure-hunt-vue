import {defineComponent, h, PropType} from "vue"
import {defaults} from 'lodash'

import {InputSpec} from "@src/modules/Typeful/types/InputSpec"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import {useTypeRegistry} from "@src/modules/Typeful/typeRegistry"

export default defineComponent({
    props: {
        modelValue: {type: Object, required: true},
        inputs: {
            type: [Object, Array] as PropType<InputSpec[]|Record<string, InputSpec>>,
            required: true,
        },
        tag: {type: String, default: 'div'},
    },
    setup(props) {
        const typeRegistry = useTypeRegistry()

        const createFieldEl = (name: string, field: InputSpec) => {
            const attrs = {
                label: name,
                name,
                ...field,

                modelValue: props.modelValue[name],
                'onUpdate:modelValue': (value: any) => {
                    props.modelValue[name] = value
                },
            }

            defaults(attrs, typeRegistry.getDefaultProps(field))

            return h(TypefulInputPair, attrs)
        }

        return () => {
            let inputs: [string, InputSpec][]
            if (Array.isArray(props.inputs)) {
                inputs = props.inputs
                    .filter((field) => {
                        if (!field.name) {
                            console.warn("Invalid input spec", field)
                            return false
                        }
                        return true
                    })
                    .map((field) => [field.name as string, field])
            } else {
                inputs = Object.entries(props.inputs)
            }

            const inputEls = inputs.map(([name, field]) => createFieldEl(name, field))

            return h(props.tag, {
                class: 'auto-section',
            }, inputEls)
        }
    },
})
