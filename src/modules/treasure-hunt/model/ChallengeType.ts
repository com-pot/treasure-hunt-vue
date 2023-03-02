import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"
import {InputSpec} from "@src/modules/Typeful/types/InputSpec"
import {useModelCollectionController} from "@src/modules/Typeful/components/useModelController"

export type ChallengeType = {
    type: string,
    params: Record<string, InputSpec>,
}

export function useChallengeTypeList(api: JsonApiAdapter) {
    return useModelCollectionController<ChallengeType>(api, 'treasure-hunt.challenge-type')
}
