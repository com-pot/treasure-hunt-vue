import {InputSpec, TypeSpec} from "@src/modules/Typeful/types/InputSpec"
import {inject} from "vue"
import {AppTypeDeclaration, TypefulAppModule} from "@src/modules/Typeful/defineTypefulModule"

export type TypeRegistry = {
    getTypeSpec(type: string): TypeSpec|undefined,
    getDefaultProps: (field: InputSpec) => object | unknown,

    getDefaultValue<T=any>(field: InputSpec): T,
}

export function createTypeRegistry(...modules: TypefulAppModule[]): TypeRegistry {
    const typeMap: Record<string, AppTypeDeclaration> = {}

    modules.forEach((module) => {
        Object.entries(module.types).forEach(([name, type]) => {
            typeMap[name] = type
            type.aliases?.forEach((alias) => typeMap[alias] = type)
        })
    })

    return {
        getTypeSpec: (type): TypeSpec|undefined => {
            return typeMap[type]
        },
        getDefaultProps(field) {
            let defaults = typeMap[field.type]?.defaults
            if (typeof defaults === 'function') {
                defaults = defaults(this, field)
            }

            return defaults
        },

        getDefaultValue(field) {
            if ('defaultValue' in field) {
                return field.defaultValue
            }

            const typeObj = this.getTypeSpec(field.type)
            let defaultValue = typeObj?.defaultValue
            if (typeof defaultValue === 'function') {
                return defaultValue(this, field)
            }

            return defaultValue
        }
    }
}

export const useTypeRegistry = (): TypeRegistry => inject('typeful.typeRegistry') as TypeRegistry
