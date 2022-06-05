import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"
import {
    extendModelController, ModelControllerOptions,
    useModelCollectionController,
    useModelInstanceController,
} from "@src/modules/Typeful/components/useModelController"
import {ThContentBlock, useThContentBlocks} from "@src/modules/treasure-hunt/model/treasureHuntContentBlocksController"
import {Action} from "@src/modules/TypefulExecutive/model/Action"

export type Clue = {
    name: string,
    slug: string,
    contentBlocks: ThContentBlock[],
    tags: string[],

    onReveal?: Action[],

    story: string,
}

export type RevealResult = Record<string, any>
export type RevealedClue = Clue & {
    revealResults: RevealResult[],
}

const clueModelOptions: ModelControllerOptions<Clue> = {
    normalizeItem: (item) => {
        if (!item.tags) {
            item.tags = []
        }
        return item
    }
}

type ClueInstanceOptions<T extends Clue> = {
    onReveal?: (clue: T) => Promise<T>,
}
export function useClueInstance<T extends Clue>(api: JsonApiAdapter, opts?: ClueInstanceOptions<T>) {
    const ctrl = useModelInstanceController<T>(api, 'treasure-hunt.clue', clueModelOptions as ModelControllerOptions<any>)
    return extendModelController(ctrl, {
        reveal: (key: string) => {
            ctrl.value = null
            let revealPromise = api.post<T>('/treasure-hunt/clue/' + key)
            if (opts?.onReveal) {
                revealPromise = revealPromise.then(opts.onReveal)
            }
            return ctrl.awaitValue(revealPromise)
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
    return useModelCollectionController<Clue>(api, 'treasure-hunt.clue', clueModelOptions)
}
