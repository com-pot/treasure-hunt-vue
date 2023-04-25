import {defineMinigameBundle} from "@src/modules/treasure-hunt/Minigames"
import { EQConfig } from "./Minigames/EQ/eq"
import {MinigameConfig as AppendagesConfig, Appendages} from "./Minigames/Appendages/appendages"

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

        registry.registerMinigame('appendages', {
            caption: "Appendages",
            module: () => import ("./Minigames/Appendages/Appendages.vue"),
            demoData: async (): Promise<AppendagesConfig> => {
                const unitModules = import.meta.globEager("./assets/robo-composition/*.png", {as: 'url'})

                const unitsMeta: Record<string, Partial<Appendages.Unit>> = {
                    trup: {
                        centerOfGravity: [0.5, 0.6],
                        joints: {
                            h: { type: 'socket', direction: 0, point: [0.5, 0.16] },
                            t: { type: 'socket', direction: 0.5, point: [0.5, 0.88] },

                            ul: { type: 'socket', direction: 0.25, point: [1, 0.15] },
                            ur: { type: 'socket', direction: 0.75, point: [0, 0.15] },

                            ll: {type: 'socket', direction: 0.375, point: [0.6, 0.815]},
                            lr: {type: 'socket', direction: 0.625, point: [0.4, 0.815]},
                        },
                    },
                    ocas: {
                        centerOfGravity: [0.5, 0],
                        joints: {
                            r: {type: 'ball', direction: 0.5, point: [0.5, 0]},
                        },
                        defaultJoint: 'r',
                    },
                    hlava: {
                        centerOfGravity: [0.5, 1],
                        joints: {
                            r: {type: 'ball', direction: 0, point: [0.5, 1]},
                        },
                        defaultJoint: 'r',
                    },
                    rukaL: {
                        joints: {
                            r: {type: 'ball', direction: 0.25, point: [0.22, 0.655]},
                        },
                        defaultJoint: 'r',
                    },
                    rukaP: {
                        joints: {
                            r: {type: 'ball', direction: 0.75, point: [1-0.2, 0.71]},
                        },
                        defaultJoint: 'r',
                    },
                    nohaP: {
                        joints: {
                            r: {type: 'ball', direction: 0.625, point: [0.7, 0.078]},
                        },
                        defaultJoint: 'r',
                    },
                    nohaL: {
                        joints: {
                            r: {type: 'ball', direction: 0.375, point: [0.26, 0.078]},
                        },
                        defaultJoint: 'r',
                    },

                }

                const units = Object.entries(unitModules).map(([key, url]): Appendages.Unit => {
                    const name = key.substring('./assets/robo-composition/'.length, key.length - '.png'.length)
                    const meta = unitsMeta[name]

                    return {
                        name,
                        img: url.default,
                        joints: meta?.joints || {},
                        centerOfGravity: meta?.centerOfGravity ?? [0.5, 0.5],
                        defaultJoint: meta?.defaultJoint,
                    }
                })

                const iChestUnit = units.findIndex((unit) => unit.name === 'trup')
                if (iChestUnit === -1) {
                    console.warn("Cannot find 'trup' unit")
                } else {
                    units.unshift(...units.splice(iChestUnit, 1))
                }

                return {
                    baseSize: [3598, 3377],
                    anchor: { p: [0.5, 0.40], unit: 'trup' },
                    
                    units,
                }
            },
        })
    },
})
