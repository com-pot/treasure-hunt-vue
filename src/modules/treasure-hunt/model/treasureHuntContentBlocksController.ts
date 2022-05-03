import {v4 as uuidV4} from "uuid"

import {Condition} from "@src/modules/TypefulExecutive/model/Condition"

// FIXME: registry should be used. for now sync with ContentBlocks.ts#typeToComponent
const types = ['text', 'challenge', 'countdown']

export function getDefaultBlockConfig(type: string): ThContentBlockConfig | null {
    if (type === 'text') {
        return {blocks: [], html: ''}
    }
    if (types.includes(type)) {
        return {}
    }

    return null
}

const getUniqueId = (list: ThContentBlock[]): string => {
    let id: string
    do {
        id = uuidV4().substring(0, 4)
    } while (list.find((block) => block.id === id))

    return id
}

export const useThContentBlocks = (getList: () => ThContentBlock[] | undefined) => {

    return {
        addContent(type: string) {
            const list = getList()
            if (!list) {
                console.warn("Cannot Clue.addContent - not initialized")
                return
            }

            const config = getDefaultBlockConfig(type)
            if (!config) {
                console.warn("Unsupported content type " + type)
                return
            }

            list.push({type, config, id: getUniqueId(list)})
        },

        getAvailableTypes: () => types,
    }
}

export type ThContentBlockConfig = Record<string, unknown>
export type ThContentBlock = {
    id?: string,

    type: string,
    config: ThContentBlockConfig,
    if?: Condition,
}
