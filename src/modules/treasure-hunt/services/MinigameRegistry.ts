import {MinigameBundle, MinigameSpecInternal} from "@src/modules/treasure-hunt/Minigames"

type MinigameSpecRegisterObj = Omit<MinigameSpecInternal, 'name'> & {
    aliases?: string[],
}

type MinigameBundleModule = {default: MinigameBundle}
type BundleInitializerFn = () => MinigameBundle | MinigameBundleModule | Promise<MinigameBundle|MinigameBundleModule>
type BundleInitializer = MinigameBundle | BundleInitializerFn

type BundleContainer = {
    name: string, caption: string,
    minigames: MinigameSpecInternal[],
}

function isBundleModule(subject: unknown): subject is MinigameBundleModule {
    if (!subject || typeof subject !== 'object') {
        return false
    }
    const module = subject as MinigameBundleModule
    return typeof module?.default?.register === 'function'
}

export default class MinigameRegistry {
    private mgIndex: Record<string, MinigameSpecInternal> = {}
    private mgAliases: Record<string, string> = {}

    private status: 'created'|'initializing'|'ready'|'error' = 'created'
    private initPromise?: Promise<void>

    private _bundles: Record<string, BundleContainer> = {}
    private _activeBundle: BundleContainer|null = null

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

                this._bundles[spec.name] = this._activeBundle = {
                    name: spec.name, caption: spec.caption, minigames: [],
                }
                spec.register(this)
            }
            this.status = 'ready'
        } catch (err) {
            this.status = 'error'
        }

    }

    get(name: string): Readonly<MinigameSpecInternal> | undefined {
        const lookup = this.toCanonicalName(name)
        return lookup ? this.mgIndex[lookup] : undefined
    }
    toCanonicalName(name: string): string | null {
        const canonical = this.mgAliases[name] || (name in this.mgIndex && name)
        if (!canonical) {
            console.warn(`No canonical name for '${name}', ${this.status}`)
            return null
        }

        return canonical
    }

    getAll(): MinigameSpecInternal[] {
        return Object.values(this.mgIndex)
    }
    getBundles(): BundleContainer[] {
        return Object.values(this._bundles)
    }

    registerMinigame(name: string, regSpec: MinigameSpecRegisterObj): void {
        if (this.mgIndex[name] || this.mgAliases[name]) {
            console.warn(`Minigame or alias '${name} already registered'`)
            return
        }

        let minigameSpec: MinigameSpecInternal = {...regSpec, name}
        this.mgIndex[name] = minigameSpec
        this._activeBundle && this._activeBundle.minigames.push(minigameSpec)

        regSpec.aliases?.forEach((alias) => {
            if (this.mgIndex[alias] || this.mgAliases[alias]) {
                console.warn(`Minigame or alias ${alias} already registered`)
                return
            }
            this.mgAliases[alias] = name
        })
    }
}
