import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"
import {useModelCollectionController} from "@src/modules/Typeful/components/useModelController"
import {InputSpec} from "@src/modules/Typeful/types/InputSpec"
import { useModelService } from "@src/modules/Typeful/vueUtils"

export type ActionType = {
    name: string,
    argumentsSchema: InputSpec<{properties: Record<string, InputSpec>}> & {type: "object"},
}

export function useActionTypeCollection(api: JsonApiAdapter) {
    return useModelCollectionController<ActionType>(useModelService(api), 'typeful-executive.action-type')
}
