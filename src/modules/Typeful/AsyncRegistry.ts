type AsyncRegistryEntry<T> = {
    p: Promise<T>,
    v?: T,
}
type AsyncEntryLoadFn<T> = (key: string) => Promise<T>

export default class AsyncRegistry<T> {
    private registry: Record<string, AsyncRegistryEntry<T>> = {}

    ensureLoaded(key: string, load: AsyncEntryLoadFn<T>): Promise<T>
    ensureLoaded(key: string[], load: AsyncEntryLoadFn<T>): Promise<T[]>

    ensureLoaded(key: string | string[], load: AsyncEntryLoadFn<T>): Promise<T | T[]> {
        if (Array.isArray(key)) {
            return Promise.all(key.map((k) => this.ensureLoaded(k, load)))
        }

        let entry = this.registry[key]
        if (!entry) {
            this.registry[key] = entry = {
                p: load(key).then((v) => entry.v = v),
            }
        }

        return entry.p
    }

    getStatus(key: string): 'unknown' | 'loading' | 'ready' {
        let entry = this.registry[key]
        if (!entry) {
            return 'unknown'
        }
        if (!entry.v) {
            return 'loading'
        }

        return 'ready'
    }
    getValue(key: string): T|undefined {
        return this.registry[key]?.v
    }
}
