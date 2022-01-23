import MinigameRegistry from "@/modules/Minigames/MinigameRegistry"

export type MinigameSpec = {
    caption: string,
    name?: string,
}

type MinigameSpecInternal = MinigameSpec & {
    demoData?: object|(() => object|Promise<object>),
    module: () => Promise<any>,
}

export type MinigameBundle = {
    register(registry: MinigameRegistry): void,
}
