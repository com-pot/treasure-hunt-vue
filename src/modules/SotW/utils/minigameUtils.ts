import {inject} from "vue";

export type MinigameControls = {
    checkSolution: (solution: string) => Promise<boolean>,
}

export const useMinigameControls = (): MinigameControls => {
    const controls = inject<MinigameControls>('sotw.minigameControls')
    if (!controls) {
        throw new Error("No 'sotw.minigameControls' provided")
    }

    return controls
}
