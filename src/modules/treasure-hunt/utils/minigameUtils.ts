import {MinigameSpec} from "../Minigames"
import MinigameRegistry from "../services/MinigameRegistry"

const registry = new MinigameRegistry([
    () => import("../general.minigameBundle"),
    () => import("@custom/sotw/sotw.minigameBundle"),
    () => import("@custom/vlm/vlm.minigameBundle"),
    () => import("@custom/furrworld/furrworld.minigameBundle"),
])


export async function listMinigames(): Promise<MinigameSpec[]> {
    await registry.whenReady()
    return registry.getAll()
        .map((mg) => ({
            name: mg.name,
            caption: mg.caption,
        }))
}
export async function listMinigameBundles() {
    await registry.whenReady()
    return registry.getBundles()
}

export async function loadMinigameComponent(challengeType: string): Promise<any> {
    await registry.whenReady()
    const mgData = registry.get(challengeType)
    if (!mgData) {
        return Promise.reject(new Error(`No minigame with id '${challengeType}'`))
    }

    return (await mgData.module()).default
}
export async function loadMinigameConfigurator(challengeType: string): Promise<any>|null {
    await registry.whenReady()
    const mgData = registry.get(challengeType)
    if (!mgData) {
        return Promise.reject(new Error(`No minigame with id '${challengeType}'`))
    }
    if (!mgData.configurator) {
        return null
    }

    return (await mgData.configurator()).default
}

export async function loadMinigameComponentDemoData(challengeType: string): Promise<object> {
    await registry.whenReady()
    const mgData = registry.get(challengeType)
    if (!mgData) {
        return Promise.reject(new Error(`No minigame with id '${challengeType}'`))
    }
    let data = mgData.demoData
    if (typeof data === 'function') {
        data = await data()
    }
    if (data && 'default' in data) {
        data = data['default']
    }

    return data || {}
}

export function useMinigameRegistry() {
    return registry
}
