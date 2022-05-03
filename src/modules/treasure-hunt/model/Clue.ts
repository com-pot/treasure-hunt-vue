import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"
import {
    extendModelController,
    useModelCollectionController,
    useModelInstanceController,
} from "@src/modules/Typeful/components/useModelController"
import {ThContentBlock, useThContentBlocks} from "@src/modules/treasure-hunt/model/treasureHuntContentBlocksController"
import {Action} from "@src/modules/TypefulExecutive/model/Action"

export type Clue = {
    name: string,
    slug: string,
    contentBlocks: ThContentBlock[],
    collectible: boolean,

    onReveal?: Action[],

    story: string,
}

export type RevealResult = { content: { html: string } }
export type RevealedClue = Clue & {
    revealResults: RevealResult[],
}

export function useClueInstance<T extends Clue>(api: JsonApiAdapter) {
    const ctrl = useModelInstanceController<T>(api, 'treasure-hunt.clue')
    return extendModelController(ctrl, {
        reveal: (key: string) => {
            return ctrl.awaitValue(api.post<T>('/treasure-hunt/clue/' + key))
        },
        contentBlocks: {
            ...useThContentBlocks(() => ctrl.value?.contentBlocks),
            getAvailableTypes: () => ['text'],
        },

        onReveal: {
            add: () => {
                if (!ctrl.value) {
                    return
                }
                if (!ctrl.value.onReveal) {
                    ctrl.value.onReveal = []
                }
                ctrl.value.onReveal.push({type: '', arguments: null})
            },
        },
    })
}

export function useClueCollection(api: JsonApiAdapter) {
    return useModelCollectionController<Clue>(api, 'treasure-hunt.clue')
}
