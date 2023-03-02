import {defineComponent} from "vue";
import {useTypeRegistry} from "@src/modules/Typeful/typeRegistry"
import {AppTypeDeclaration} from "@src/modules/Typeful/defineTypefulModule"

export type InputComponent = ReturnType<typeof defineComponent>;
export type InputRegistry = {
    get(type: string): InputComponent|undefined,
}

export const useInputRegistry = (): InputRegistry => {
    const typeRegistry = useTypeRegistry()

    return {
        get: (type) => (typeRegistry.getTypeSpec(type) as AppTypeDeclaration)?.component,
    }
}
