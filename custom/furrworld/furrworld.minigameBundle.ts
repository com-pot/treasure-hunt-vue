import {defineMinigameBundle} from "@src/modules/treasure-hunt/Minigames"
import { EQConfig } from "./Minigames/EQ/eq"

export default defineMinigameBundle({
    name: 'furrworld', caption: "Furrworld",

    register(registry) {
        registry.registerMinigame('shortCircuit', {
            caption: "Short circuit",
            module: () => import("./Minigames/ShortCircuit/ShortCircuit.vue"),
            demoData: () => import("./Minigames/ShortCircuit/demoData.json"),
        })

        registry.registerMinigame('eq', {
            caption: "EQ",
            module: () => import("./Minigames/EQ/EQ.vue"),
            demoData: (): EQConfig => {
                return {
                    appearance: 'col',
                    channels: [
                        {
                            name: 'a',
                            label: "Alpha",
                            range: [1, 15],
                            default: 5,
                        },
                        {
                            name: 'b',
                            label: "Beta",
                            range: [1, 15],
                            default: 1,
                        },
                        {
                            name: 'c',
                            label: "Gamma",
                            range: [1, 15],
                            default: 3,
                        },
                        {
                            name: 'd',
                            label: "Derp",
                            range: [1, 15],
                            default: 9,
                        },
                    ],
                    bindings: {
                        a: [
                            ['b', -3],
                        ],
                        b: [
                            ['a', -5],
                            ['d', 2],
                        ],
                        c: [
                            ['a', -2],
                            ['b', 2],
                        ],
                    },
                }
            },
        })
    },
})
