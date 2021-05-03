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
        .then(() => {
        })
}

export default class Resources<T extends { [name: string]: Resource }> {
    private _ready?: Promise<void>
    private _status: AsyncStatus = 'pending'

    constructor(private readonly resources: T) {
    }

    public get<K extends keyof T>(name: K): T[K] {
        return this.resources[name]
    }

    public whenReady(): Promise<void> {
        if (!this._ready) {
            this._ready = waitForAll(Object.values(this.resources))
        }
        return this._ready
    }

    public get status(): AsyncStatus {
        return this._status
    }
}
