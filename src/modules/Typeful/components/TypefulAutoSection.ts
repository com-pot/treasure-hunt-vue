import {defineComponent, h, PropType} from "vue"
import {defaults, get, set} from 'lodash'

import {InputSpec} from "@src/modules/Typeful/types/InputSpec"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import {useTypeRegistry} from "@src/modules/Typeful/typeRegistry"
import { InputRef } from "../model/TypefulModel"

export default defineComponent({
    name: "TypefulAutoSection",
    props: {
        modelValue: {type: Object, required: true},
        inputs: {
            type: [Object, Array] as PropType<(InputSpec | InputRef)[]|Record<string, InputSpec>>,
            required: true,
        },
        tag: {type: String, default: 'div'},
    },
    setup(props) {
        const typeRegistry = useTypeRegistry()

        const createFieldEl = (name: string, field: InputSpec | InputRef) => {
            const path = "path" in field ? field.path as string[] : field.name || name
            const attrs = {
                label: name,
                name,
                ...field,

                modelValue: get(props.modelValue, path),
                'onUpdate:modelValue': (value: any) => {
                    set(props.modelValue, path, value)
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
