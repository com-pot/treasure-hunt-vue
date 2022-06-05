import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"
import {useModelCollectionController} from "@src/modules/Typeful/components/useModelController"
import {InputSpec} from "@src/modules/Typeful/types/InputSpec"

export type ActionType = {
    name: string,
    arguments: Record<string, InputSpec>,
}

export function useActionTypeCollection(api: JsonApiAdapter) {
    return useModelCollectionController<ActionType>(api, 'typeful-executive.action-type')
}
