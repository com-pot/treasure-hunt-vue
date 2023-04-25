export type Resource = HTMLImageElement
type AsyncStatus = 'pending' | 'ready' | 'error'

export function waitForAll(resources: Resource[]): Promise<void> {
    return Promise.all(resources.map((res) => {
        if (res.complete) {
            return true
        }
        return new Promise((resolve) => {
            res.onload = resolve
        })
    }))
        .then(() => {})
}

export default class Resources<T extends { [name: string]: Resource } = { [name: string]: Resource }> {
    private _ready?: Promise<void>

    constructor(private readonly resourceIndex: T) {
    }

    public get<K extends keyof T>(name: K): T[K] {
        return this.resourceIndex[name]
    }

    public whenReady(): Promise<void> {
        if (!this._ready) {
            this._ready = waitForAll(Object.values(this.resourceIndex))
        }
        return this._ready
    }
}

export function prepareImageResourceIndex(specIndex: Record<string, string | HTMLImageElement> | (readonly [string, string | HTMLImageElement])[]) {
    const specEntries = Array.isArray(specIndex) ? specIndex : Object.entries(specIndex)

    const entries = specEntries.map((entry) => {
        if (entry[1] instanceof HTMLImageElement) {
            return entry as [string, HTMLImageElement]
        }
        const image = new Image()
        image.src = entry[1]
        return [entry[0], image] as const
    })

    
    return Object.fromEntries(entries)
}
