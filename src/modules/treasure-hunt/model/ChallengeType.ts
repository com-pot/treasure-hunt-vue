import {InputSpec} from "@src/modules/Typeful/types/InputSpec"
import {useModelCollectionController} from "@src/modules/Typeful/components/useModelController"
import { ModelService } from "@src/modules/Typeful/modelService"

export type ChallengeType = {
    type: string,
    params: Record<string, InputSpec>,
}

export function useChallengeTypeList(modelService: ModelService) {
    return useModelCollectionController<ChallengeType>(modelService, 'treasure-hunt.challenge-type')
}
