import { defineComponent } from "vue";

import CBText from "./contentBlockTypes/ContentBlock-Text.vue"
import CBChallenge from "./contentBlockTypes/ContentBlock-Challenge.vue"
import CBCountdown from "./contentBlockTypes/ContentBlock-Countdown.vue"
import CBStorySummary from "./contentBlockTypes/ContentBlock-StorySummary.vue"
import { ThContentBlockConfig } from "../model/treasureHuntContentBlocksController";

type ContentBlockTypeEntry = {
    component: ReturnType<typeof defineComponent>,
    defaultData?: () => ThContentBlockConfig,
}

const typeToComponent: Record<string, ContentBlockTypeEntry> = {
    text: {
        component: CBText,
        defaultData: () => ({blocks: [], html: ''}),
    },
    challenge: {
        component: CBChallenge,
    },
    countdown: {
        component: CBCountdown,
    },
    'story-summary': {
        component: CBStorySummary,
    },
}

export const useContentBlockRegistry = () => {
    return {
        typeToComponent,

        availableTypes: Object.keys(typeToComponent),

        getDefaultBlockConfig(type: string): ThContentBlockConfig | null {
            const typeObj = typeToComponent[type]
            if (!type) return null

            return typeObj.defaultData?.() ?? {}
        },
    }
}