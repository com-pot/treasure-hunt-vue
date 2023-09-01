import { SearchParams } from "@src/modules/Api/services/JsonApiAdapter"
import { InputSpec } from "../types/InputSpec"
import { StringifySpec } from "./stringify"

export type TypefulModel = {
    meta: {
        module: string,
        name: string,
        entityFqn: string,
    },
    endpoints: {
        collection: string,
        entityAny: string,
        entityExact: string,
    },
    schema: ModelSchema,
    primaryKey: string,
    stringify?: StringifySpec,
}
type ModelSchema = InputSpec & { type: 'object' }

/**
 * @deprecated split into individual types with attention to input/result pagination
 */
export type ModelServiceQueryTypes = {
    filter: string | SearchParams,
    sort: never,
    pagination: Partial<{ page: number, perPage: number }>,
}

type RefPath = string[]
export type InputRef = InputSpec & { path: RefPath }
type ModelInputGroup = {
    path: RefPath,
    inputs: InputRef[],
}

const locales = ["cs", "en"]
export function crawlInputGroups(model: TypefulModel) {
    const groups: ModelInputGroup[] = []

    const toWalk: [RefPath, InputSpec][] = [[[], model.schema]]

    while (toWalk.length) {
        const [path, spec] = toWalk.shift()

        const inputs: ModelInputGroup["inputs"] = []

        for (let [name, prop] of Object.entries(spec.properties || {})) {
            const propPath = [...path, name]
            if (prop.type === "object") {
                toWalk.push([propPath, prop])
                continue
            }
            inputs.push({...prop, path: propPath, name})
        }
        if (spec.additionalProperties && spec["x-i18n"] === "map") {
            locales.forEach((locale) => {
                const propPath = [...path, locale]
                inputs.push({...spec.additionalProperties as InputSpec, path: propPath, name: locale})
            })
        }

        inputs.length && groups.push({path, inputs})
    }

    return groups
}