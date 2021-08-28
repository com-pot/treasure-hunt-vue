
const minigameModuleLoaders: {[challengeType: string]: () => Promise<any>} =  {
    anagram: () => import('./components/Anagram/AnagramComponent.vue'),
    password: () => import('./components/Password/PasswordComponent.vue'),
    bpc: () => import('./components/Bpc/BpcComponent.vue'),
    drums: () => import('./components/Drums/DrumsComponent.vue'),
    rings: () => import('./components/CircularDomino/CircularDominoComponent.vue'),
    mixMatch: () => import('./components/MixMatch/MixMatchComponent.vue'),
    toggleMatrix: () => import('./components/ToggleMatrix/ToggleMatrixComponent.vue'),
    'quick-pick': () => import("./components/Understand/UnderstandComponent.vue"),
    comboPick: () => import("./components/ComboPick/ComboPick.vue"),
    zebraFoal: () => import('./components/ZebraFoal/ZebraFoalComponent.vue'),
};

export function loadMinigameComponent(challengeType: string): Promise<any> {
    if (!(challengeType in minigameModuleLoaders)) {
        throw new Error(`No minigame with id '${challengeType}'`);
    }

    return minigameModuleLoaders[challengeType]();
}
