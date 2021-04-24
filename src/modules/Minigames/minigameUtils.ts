
const minigameModuleLoaders: {[minigameId: string]: () => Promise<any>} =  {
    anagram: () => import('./components/Anagram/AnagramComponent.vue'),
    bpc: () => import('./components/Bpc/BpcComponent.vue'),
    drums: () => import('./components/Drums/DrumsComponent.vue'),
    mixMatch: () => import('./components/MixMatch/MixMatchComponent.vue'),
    toggleMatrix: () => import('./components/ToggleMatrix/ToggleMatrixComponent.vue'),
    understand: () => import("./components/Understand/UnderstandComponent.vue"),
    comboPick: () => import("./components/ComboPick/ComboPick.vue"),
    zebraFoal: () => import('./components/ZebraFoal/ZebraFoalComponent.vue'),
};

export function loadMinigameComponent(minigameId: string): Promise<any> {
    if (!(minigameId in minigameModuleLoaders)) {
        throw new Error(`No minigame with id '${minigameId}'`);
    }

    return minigameModuleLoaders[minigameId]();
}
