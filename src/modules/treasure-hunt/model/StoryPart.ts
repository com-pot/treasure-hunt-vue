import {OutputBlockData} from "@editorjs/editorjs"
import {ThContentBlock, useThContentBlocks} from "@src/modules/treasure-hunt/model/treasureHuntContentBlocksController"
import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"
import {
    extendModelController,
    ModelControllerOptions,
    useModelCollectionController,
    useModelInstanceController,
} from "@src/modules/Typeful/components/useModelController"

export interface PartOfStory {
    slug: string,
    title: string,
    story: string,
    order: number,

    contentBlocks?: OutputBlockData[],
    contentHtml?: string,
    /** @deprecated - use .contentHtml */
    content?: string,
    challenge?: string,

    contentController: 'inline' | 'th-blocks' | string,
    thContentBlocks: ThContentBlock[],
}

const options: ModelControllerOptions<PartOfStory> = {
    normalizeItem: (item) => {
        if (!item.contentController) {
            item.contentController = 'inline'
        }
        return item
    },
}

export const useStoryPartInstance = (api: JsonApiAdapter) => {
    const ctrl = useModelInstanceController<PartOfStory>(api, 'treasure-hunt.story-part', options)

    return extendModelController(ctrl, {
        thContentBlocks: useThContentBlocks(() => ctrl.value?.thContentBlocks),

        getStoryPartBlocks(): OutputBlockData[] | null {
            const storyPart = ctrl.value
            if (!storyPart || storyPart.contentController !== 'inline') {
                return null
            }

            let blocks = storyPart.contentBlocks
            if (!blocks || !blocks.length) {
                console.warn("Parsing content into blocks from", storyPart)
                let content: string = storyPart.contentHtml || storyPart.content || ''
                blocks = [
                    {
                        type: 'paragraph',
                        data: {
                            text: content.replaceAll('--glow', 'background-color'),
                        },
                    },
                ]
            }

            return blocks
        },
    })
}

export const useStoryPartCollection = (api: JsonApiAdapter) => {
    return useModelCollectionController<PartOfStory>(api, 'treasure-hunt.story-part')
}
