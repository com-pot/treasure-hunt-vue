import defineTypefulModule, {defineAppType} from "@src/modules/Typeful/defineTypefulModule"

import TextInput from "./components/TextInput.vue"
import ObjectInput from "./components/ObjectInput.vue"

import Multiselect from "@vueform/multiselect"
import "@vueform/multiselect/themes/default.scss"
import NumberInput from "@src/modules/Typeful/inputs/components/NumberInput.vue"
import TypefulList from "@src/modules/Typeful/components/TypefulList.vue"

import {InputSpec} from "@src/modules/Typeful/types/InputSpec"
import RelationInput from "@src/modules/Typeful/inputs/components/RelationInput"
import SelectionBtnGroup from "@src/modules/Typeful/inputs/components/SelectionBtnGroup.vue"
import TypefulAutoSection from "@src/modules/Typeful/components/TypefulAutoSection"
import {h} from "vue"
import {produceMutable} from "@src/utils/immutable"
import BoolInput from "@src/modules/Typeful/inputs/components/BoolInput.vue"
import TimeInput from "@src/modules/Typeful/inputs/components/TimeInput.vue"

type ArrayTypeProps = {
    items?: InputSpec,
}
type ObjectTypeProps = {
    properties?: Record<string, InputSpec>,
    additionalProperties?: true | InputSpec,
}

export default defineTypefulModule({
    name: 'typeful',
    types: {
        text: defineAppType<any>({
            component: TextInput,
            aliases: ['string'],
            defaultValue: () => '',
            defaults: (typeRegistry, field) => {
                let defaults: Record<string, unknown> = {}

                if (field["x-multiline"]) {
                    defaults.mode = "block"
                }

                return defaults
            },
        }),
        number: {component: NumberInput, defaultValue: () => 0},
        bool: {component: BoolInput, defaultValue: () => false},
        time: {component: TimeInput},

        select: {
            component: (discriminator: string) => {
                if (discriminator === 'btn-group') {
                    return SelectionBtnGroup
                }
                return Multiselect
            },
        },
        relation: {component: RelationInput},

        array: defineAppType<ArrayTypeProps>({
            component: TypefulList,
            aliases: ['list'],
            defaultValue: () => [],
            defaults: (typeRegistry, field) => {
                let defaults: Record<string, unknown> = {}

                const itemsSchema = field.items
                const type = itemsSchema?.type && typeRegistry.getTypeSpec(itemsSchema.type)
                if (type) {
                    defaults.createItem = () => typeRegistry.getDefaultValue(itemsSchema)
                }

                return defaults
            },
        }),
        object: defineAppType<ObjectTypeProps>({
            component: function (props: any) {
                if (!props) {
                    props = {}
                }

                if (props.format === "json") return h(ObjectInput, props) 

                props = produceMutable(props, (props: any) => {
                    props.inputs = props.properties
                    delete props.properties
                })
                return h(TypefulAutoSection, props)
            },
            aliases: ['schema'],
            defaultValue: (typeRegistry, schema) => {
                const properties = schema.properties
                if (!properties) {
                    if (schema.additionalProperties) return {}

                    console.warn('Invalid spec for', schema)
                    return null
                }

                const defaultValue: Record<string, unknown> = {}
                Object.entries(properties).forEach(([name, propSchema]) => {
                    defaultValue[name] = typeRegistry.getDefaultValue(propSchema)
                })

                return defaultValue
            },
        }),
    },
})
