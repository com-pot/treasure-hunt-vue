import { inject, provide, reactive } from "vue";
import { PlayerProgression } from "./TreasureHuntModel";

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
