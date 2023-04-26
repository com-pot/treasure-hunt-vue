import {v4 as uuidV4} from "uuid"

import {Condition} from "@src/modules/TypefulExecutive/model/Condition"
import { useContentBlockRegistry } from "../content/contentBlockRegistry"

const getUniqueId = (list: ThContentBlock[]): string => {
    let id: string
    do {
        id = uuidV4().substring(0, 4)
    } while (list.find((block) => block.id === id))

    return id
}

export const useThContentBlocks = (getList: () => ThContentBlock[] | undefined) => {
    const contentBlockRegistry = useContentBlockRegistry()
    
    return {
        addContent(type: string) {
            const list = getList()
            if (!list) {
                console.warn("Cannot Clue.addContent - not initialized")
                return
            }

            const config = contentBlockRegistry.getDefaultBlockConfig(type)
            if (!config) {
                console.warn("Unsupported content type " + type)
                return
            }

            list.push({type, config, id: getUniqueId(list)})
        },

        getAvailableTypes: () => contentBlockRegistry.availableTypes,
    }
}

export type ThContentBlockConfig = Record<string, unknown>
export type ThContentBlock = {
    id?: string,

    type: string,
    config: ThContentBlockConfig,
    if?: Condition,
}
