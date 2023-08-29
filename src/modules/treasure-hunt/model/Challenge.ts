import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"
import MinigameRegistry from "@src/modules/treasure-hunt/services/MinigameRegistry"
import {extendModelController, useModelInstanceController} from "@src/modules/Typeful/components/useModelController"
import { useModelService } from "@src/modules/Typeful/vueUtils"

export type Challenge = {
    type: string,
    challengeConfig: Record<string, unknown>,
    onError: any[],

    cluesSetup: ChallengeCluesSetup,

}
type ChallengeClueUsage = {
    clue: string,
    effect: {
        whenActive: any,
        whenWrongOrder: any,
    },
}

export type ChallengeCluesSetup = {
    strategy: 'linear-path',
    list: ChallengeClueUsage[],
    clueDefaults: any,
}

export function useChallengeInstance(api: JsonApiAdapter, minigameRegistry?: MinigameRegistry) {
    const ctrl = useModelInstanceController<Challenge>(useModelService(api), 'treasure-hunt.challenge', {
        normalizeItem: !minigameRegistry ? undefined : async (challenge) => {
            await minigameRegistry.whenReady()
            challenge.type = minigameRegistry.toCanonicalName(challenge.type) || ''
            return challenge
        },
    })

    return extendModelController(ctrl, {
        addClues(this: typeof ctrl) {
            if (!this.value) {
                console.warn("Value not set, cannot addClues")
                return
            }

            this.value.cluesSetup = {
                strategy: 'linear-path',
                list: [],
                clueDefaults: {},
            }
        },
    })
}
