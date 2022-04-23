import {defineComponent, h} from "vue"
import {AppTypeDeclaration} from "@src/modules/Typeful/defineTypefulModule"
import {useTypeRegistry} from "@src/modules/Typeful/typeRegistry"


export default defineComponent({
    name: 'TypefulInput',
    inheritAttrs: false,
    props: {
        type: {type: String, default: 'text'},
        inOpts: {type: Object},
    },

    setup(props, context) {
        const typeRegistry = useTypeRegistry()

        function getComponent(type: string, inputProps: Record<string, unknown>) {
            const typeSpec = typeRegistry.getTypeSpec(props.type)
            if (!typeSpec) {
                return null
            }
            let component: AppTypeDeclaration['component'] = typeSpec?.component
            const discriminator = (typeSpec.componentDiscriminator ?? 'mode') as string

            if (typeof component === 'function') {
                const discriminatorValue = inputProps[discriminator]
                delete inputProps[discriminator]

                component = component(discriminatorValue)
            }

            return component ?? null
        }

        return () => {
            const inputProps = Object.assign({}, context.attrs, props.inOpts)
            if (typeof context.attrs.name === 'string') {
                inputProps.key = context.attrs.name
            }

            const component = getComponent(props.type, inputProps)
            if (component) {
                return h(component, inputProps, context.slots)
            }

            console.warn("Unknown input spec", props.type, inputProps)
            return h('div', {
                ...inputProps,
                key: inputProps.name,
            }, [`model error [type='${props.type}']`])
        }
    },
})
