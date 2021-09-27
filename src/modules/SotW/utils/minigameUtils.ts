import {inject} from "vue";

export type MinigameControls<T=any> = {
    checkSolution: (solution?: string) => Promise<boolean>,
    serializeSolution: (solution: string) => string,
    status?: string,

    reset?: () => any,
    getValue?: () => T|Promise<T>,
}

type MinigameControlsOptions<T=string> = {
    reset?: () => any,
    getValue?: () => T | Promise<T>,
}

export const useMinigameControls = <T>(options?: MinigameControlsOptions<T>): MinigameControls<T> => {
    const controls = inject<MinigameControls>('sotw.minigameControls')
    if (!controls) {
        throw new Error("No 'sotw.minigameControls' provided")
    }
    if (options) {
        controls.reset = options.reset
        controls.getValue = options.getValue
    }

    return controls
}
