import {defineMinigameBundle} from "@src/modules/treasure-hunt/Minigames"

export default defineMinigameBundle({
    name: 'vlm', caption: "Viva la Mexico",

    register(registry) {
        registry.registerMinigame('counter-selection', {
            caption: "Counter selection",
            module: () => import('./Minigames/CounterSelection/CounterSelection.vue'),
        })
    },
})
