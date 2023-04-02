import {defineMinigameBundle} from "@src/modules/treasure-hunt/Minigames"

export default defineMinigameBundle({
    name: 'furrworld', caption: "Furrworld",

    register(registry) {
        registry.registerMinigame('shortCircuit', {
            caption: "Short circuit",
            module: () => import("./Minigames/ShortCircuit/ShortCircuit.vue"),
            demoData: () => import("./Minigames/ShortCircuit/demoData.json"),
        })
    },
})
