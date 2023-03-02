import {TypeRegistry} from "@src/modules/Typeful/typeRegistry"

export type defaultValueFn<T extends object, TValue> = (typeRegistry: TypeRegistry, field: InputSpec<T>) => TValue | undefined


export type TypeSpec<TOptions extends object = {}, TValue = any> = {
    defaultValue?: defaultValueFn<TOptions, TValue>,
    [additionalParam: string]: unknown,
}

export type InputSpec<TOptions extends object = {}> = {
    type: string,

    name?: string,
    defaultValue?: any
} & TOptions
