import { inject, provide, reactive, ref } from "vue";
import { PlayerProgression } from "./TreasureHuntModel";
import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter";
import { useAsyncState } from "@vueuse/core";

export function createPlayerProgression(opts: {reload: () => Promise<void>}, di?: 'provide'): PlayerProgression {
    const playerProgression = reactive<PlayerProgression>({
        storyParts: [],
  
        reload: () => opts.reload(),
    })

    if (di === 'provide') {
        provide('player.progression', playerProgression)
    }

    return playerProgression
}

export function usePlayerProgression() {
    const progression = inject<PlayerProgression>('player.progression')
    if (!progression) {
        throw new Error("'player.progression' is not provided")
    }
    return progression
}

export function usePlayerBag(api: JsonApiAdapter) {
    const queryItems = ref<string[]>([])
    const contents = useAsyncState<string[]>(async () => {
        const result = await api.post("/treasure-hunt/bag/inquiry", {items: queryItems.value}) as {items: string[]}
        return result.items
    }, [], {immediate: false})

    return {
        contents,
        load(items: string[]) {
            queryItems.value = items
            return contents.execute()
        },

        hasItem(itemName: string) {
            if (!contents.isReady) return
            return contents.state.value.includes(itemName)
        },
    }
}
