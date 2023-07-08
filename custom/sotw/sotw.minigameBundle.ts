import {MinigameBundle} from "@src/modules/treasure-hunt/Minigames"


const sotwBundle: MinigameBundle = {
    name: 'sotw', caption: "Spirit of the Wild",

    register(registry) {
        registry.registerMinigame('drums', {
            caption: "Drums",
            module: () => import('./Minigames/Drums/DrumsComponent.vue'),
        })
        registry.registerMinigame('rings', {
            caption: "Rings-Spin",
            module: () => import('./Minigames/CircularDomino/CircularDominoComponent.vue'),
            demoData: () => import('./Minigames/CircularDomino/demoData.json'),
        })
        registry.registerMinigame('mixMatch', {
            caption: "Mix-Match",
            module: () => import('./Minigames/MixMatch/MixMatchComponent.vue'),
            demoData: () => import('./Minigames/MixMatch/demoData.json'),
        })

        registry.registerMinigame('quick-pick', {
            caption: "Quick pick",
            module: () => import('./Minigames/Understand/UnderstandComponent.vue'),
            demoData: {
                wordsPerRound: 3,
                optionsPerWord: 4,
                stepTimeLimit: 7,
                wordsPreset: "fw",
                inputMode: "picture",
            },
        })
        registry.registerMinigame('comboPick', {
            caption: "Combo pick",
            module: () => import('./Minigames/ComboPick/ComboPick.vue'),
            demoData: {
                prompts: [
                    {color: 'red'},
                    {color: 'white'},
                    {color: 'yellow'},
                    {color: 'green'},
                    {color: 'blue'},
                    {color: '#808'},
                ],
                options: {
                    default: [
                        {value: 'n/a', label: 'žádný význam'},
                        {value: 'shr', label: 'sdílení'},
                        {value: 'mag', label: 'magie'},
                        {value: 'int', label: 'intuice'},
                        {value: 'rlg', label: 'víra'},
                        {value: 'hea', label: 'léčení'},
                        {value: 'itl', label: 'intelekt'},
                    ],
                    war: [
                        {value: 'n/a', label: 'žádný význam'},
                        {value: 'cnf', label: 'sebevědomí'},
                        {value: 'enr', label: 'energie'},
                        {value: 'end', label: 'vytrvalost'},
                        {value: 'det', label: 'odhodlání'},
                        {value: 'sor', label: 'smutek'},
                    ],
                },
            },
        })
        registry.registerMinigame('zebraFoal', {
            caption: "Zebra foal",
            module: () => import('./Minigames/ZebraFoal/ZebraFoalComponent.vue'),
            demoData: () => import('./Minigames/ZebraFoal/demoData.json'),
        })
    },
}

export default sotwBundle
