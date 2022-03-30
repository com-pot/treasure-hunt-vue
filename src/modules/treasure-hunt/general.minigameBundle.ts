import {MinigameBundle} from "@src/modules/treasure-hunt/types/minigames"

const generalMinigameBundle: MinigameBundle = {
    register(registry) {
        registry.registerMinigame('anagram', {
            caption: "Anagram",
            module: () => import('./Minigames/Anagram/AnagramComponent.vue'),
            demoData: {
                inputText: 'nag a ram',
                outputLength: 7,
            },
        })
        registry.registerMinigame('password', {
            caption: "Password",
            module: () => import('./Minigames/Password/PasswordComponent.vue'),
            demoData: {
                prompt: 'What time is it??',
            },
        })
        registry.registerMinigame('bpc', {
            caption: "BPC",
            module: () => import('./Minigames/Bpc/BpcComponent.vue'),
            demoData: {
                inputs: [
                    {name: 'sticks', caption: "Tyčky"},
                    {name: 'diamonds', caption: "Diamanty"},
                ],
            },
        })
        registry.registerMinigame('toggleMatrix', {
            caption: "Toggle matrix",
            module: () => import('./Minigames/ToggleMatrix/ToggleMatrixComponent.vue'),
            demoData: {
                width: 3,
                height: 3,
                fields: [
                    {row: 1, col: 1, label: 'A', key: 'albatros'},
                    {row: 2, col: 1, label: 'B', key: 'boar'},
                    {row: 3, col: 1, label: 'D', key: 'deer'},

                    {row: 1, col: 2, label: 'C', key: 'cicada'},
                    {row: 2, col: 2, label: 'H', key: 'hound'},
                    {row: 3, col: 2, label: 'J', key: 'jackal'},

                    {row: 1, col: 3, label: 'F', key: 'flamingo'},
                    {row: 2, col: 3, label: 'E', key: 'emu'},
                    {row: 3, col: 3, label: 'G', key: 'grizzly'},
                ],
            },
        })
        registry.registerMinigame('combination-lock', {
            caption: "Combination lock",
            module: () => import('./Minigames/CombinationLock/CombinationLock.vue'),
            demoData: {
                digits: [
                    {options: 'alpha'},
                    {options: 'num'},
                ],
            },
        })
        registry.registerMinigame('finalChoice', {
            caption: "Choice",
            module: () => import('./Minigames/Choice/ChoiceComponent.vue'),
            demoData: {
                options: ['bear', 'cougar', 'fox', 'deer', 'wolf', 'owl', 'bison'],
            },
        })
    }
}

export default generalMinigameBundle
