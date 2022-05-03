import {defineMinigameBundle} from "@src/modules/treasure-hunt/Minigames"

export default defineMinigameBundle({
    name: 'vlm', caption: "Viva la Mexico",

    register(registry) {
        registry.registerMinigame('time-tables', {
            caption: "Time tables",
            module: () => import('./Minigames/TimeTables/TimeTablesComponent.vue'),

            // configurator: () => import('./Minigames/TimeTables/TimeTablesConfigurator.vue'),
        })

        registry.registerMinigame('counter-selection', {
            caption: "Counter selection",
            module: () => import('./Minigames/CounterSelection/CounterSelection.vue'),
        })
    },
})
