import MinigameRegistry from "./services/MinigameRegistry"

export type MinigameSpec = {
    caption: string,
    name?: string,
}

export type MinigameSpecInternal = MinigameSpec & {
    demoData?: object|(() => object|Promise<object>),
    module: () => Promise<any>,

    configurator?: () => Promise<any>,
}

export type MinigameBundle = {
    name: string, caption: string,
    register(registry: MinigameRegistry): void,
}

export const defineMinigameBundle = <T extends MinigameBundle>(bundle: T): T => bundle
