import {MinigameSpec} from "../types/minigames"
import MinigameRegistry from "../services/MinigameRegistry"

const registry = new MinigameRegistry([
    () => import("@src/../custom/sotw/sotw.minigameBundle"),
    () => import("../general.minigameBundle"),
])


export async function listMinigames(): Promise<MinigameSpec[]> {
    await registry.whenReady()
    return registry.getAll()
        .map((mg) => ({
            name: mg.name,
            caption: mg.caption,
        }))
}

export async function loadMinigameComponent(challengeType: string): Promise<any> {
    await registry.whenReady()
    const mgData = registry.get(challengeType)
    if (!mgData) {
        return Promise.reject(new Error(`No minigame with id '${challengeType}'`))
    }

    return mgData.module()
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
