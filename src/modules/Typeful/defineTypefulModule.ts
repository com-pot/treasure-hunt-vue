import {InputSpec, TypeSpec} from "@src/modules/Typeful/types/InputSpec"
import {InputComponent} from "@src/modules/Typeful/inputs/inputRegistry"
import {TypeRegistry} from "@src/modules/Typeful/typeRegistry"

export default <T extends TypefulAppModule>(module: T): T => module

export type AppTypeDeclaration<T extends {} = {}, TValue = any> = {
    component?: InputComponent // | ((componentDiscriminator: string) => InputComponent),
    // componentDiscriminator?: string,
    defaults?: Record<string, unknown> | ((typeRegistry: TypeRegistry, field: InputSpec<T>) => Record<string, unknown> | undefined),

    aliases?: string[],

    defaultValue?: TypeSpec<T, TValue>['defaultValue'],
}
export const defineAppType = <T extends {} = {}, TValue = any>(type: AppTypeDeclaration<T, TValue>): AppTypeDeclaration<T, TValue> => type

export type TypefulAppModule = {
    name: string,
    types: Record<string, AppTypeDeclaration>,
}
