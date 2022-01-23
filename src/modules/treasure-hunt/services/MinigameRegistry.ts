import {MinigameBundle, MinigameSpecInternal} from "@/modules/treasure-hunt/types/minigames"

type MinigameSpecRegisterObj = Omit<MinigameSpecInternal, 'name'>

type MinigameBundleModule = {default: MinigameBundle}
type BundleInitializerFn = () => MinigameBundle | MinigameBundleModule | Promise<MinigameBundle|MinigameBundleModule>
type BundleInitializer = MinigameBundle | BundleInitializerFn

function isBundleModule(subject: unknown): subject is MinigameBundleModule {
    if (!subject || typeof subject !== 'object') {
        return false
    }
    const module = subject as MinigameBundleModule
    return typeof module?.default?.register === 'function'
}

export default class MinigameRegistry {
    private mgIndex: Record<string, MinigameSpecInternal> = {}
    private status: 'created'|'initializing'|'ready'|'error' = 'created'
    private initPromise?: Promise<void>

    constructor(private readonly bundleInits: BundleInitializer[] = []) {

    }

    public whenReady(): Promise<void> {
        if (!this.initPromise) {
            this.initPromise = this.initBundles()
        }
        return this.initPromise
    }

    async initBundles(): Promise<void> {
        if (this.status !== 'created') {
            console.warn("Bundles initializer run multiple times")
            return
        }

        this.status = 'initializing'

        try {
            for (let initializer of this.bundleInits) {
                let spec = typeof initializer === 'function' ? await initializer() : initializer
                if (isBundleModule(spec)) {
                    spec = spec.default
                }
                spec.register(this)
            }
            this.status = 'ready'
        } catch (err) {
            this.status = 'error'
        }

    }

    get(name: string): Readonly<MinigameSpecInternal> | undefined {
        return this.mgIndex[name]
    }

    getAll(): MinigameSpecInternal[] {
        return Object.values(this.mgIndex)
    }

    registerMinigame(name: string, regSpec: MinigameSpecRegisterObj): void {
        if (this.mgIndex[name]) {
            console.warn(`Minigame '${name} already registered'`)
            return
        }

        this.mgIndex[name] = {...regSpec, name}
    }
}
