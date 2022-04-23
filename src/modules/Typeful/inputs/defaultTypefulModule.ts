import defineTypefulModule, {defineAppType} from "@src/modules/Typeful/defineTypefulModule"

import TextInput from "./components/TextInput.vue"

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

type ArrayTypeProps = {
    items?: InputSpec,
    innerType?: InputSpec,
}
type ObjectTypeProps = {
    fields?: Record<string, InputSpec>,
    properties?: Record<string, InputSpec>,
}

export default defineTypefulModule({
    name: 'typeful',
    types: {
        text: {component: TextInput, aliases: ['string'], defaultValue: () => ''},
        number: {component: NumberInput, defaultValue: () => 0},
        bool: {component: BoolInput, defaultValue: () => false},

        select: {
            component: (discriminator: string) => {
                if (discriminator === 'btn-group') {
                    return SelectionBtnGroup
                }
                return Multiselect
            },
        },
        relation: {component: RelationInput},

        // json-schema structure types
        array: defineAppType<ArrayTypeProps>({
            component: TypefulList,
            aliases: ['list'],
            defaultValue: () => [],
            defaults: (typeRegistry, field) => {
                let defaults: Record<string, unknown> = {}

                const innerType = field.items || field.innerType
                const typeStr = innerType?.type
                const type = typeStr && typeRegistry.getTypeSpec(typeStr)
                if (type) {
                    defaults.createItem = () => typeRegistry.getDefaultValue(innerType)
                }

                console.log('list defaults', defaults, 'from', field)

                return defaults
            },
        }),
        object: defineAppType<ObjectTypeProps>({
            component: function (props: any) {
                return h(TypefulAutoSection, produceMutable(props, (props: any) => {
                    props.inputs = props.fields
                    delete props.fields
                }))
            },
            aliases: ['schema'],
            defaultValue: (typeRegistry, field) => {
                const fields = field.fields || field.properties
                if (!fields) {
                    console.warn('Invalid spec for', field)
                    return null
                }

                const defaultValue: Record<string, unknown> = {}
                Object.entries(fields).forEach(([name, field]) => {
                    defaultValue[name] = typeRegistry.getDefaultValue(field)
                })

                return defaultValue
            },
        }),
    },
})
