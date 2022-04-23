import {computed, ref} from "vue"

type LocalStorageValueOptions<T> = {
    default?: T,
    serialize?: (val: T) => string,
    deserialize?: (ser: string) => T,
}

export default function (key: string, opts: LocalStorageValueOptions<string> = {}) {
    type T = string|undefined
    const inMemory = ref<T>(localStorage.getItem(key) || opts.default)
    return computed<T>({
        get() {
            return inMemory.value
        },
        set(value) {
            if (!value) {
                localStorage.removeItem(key)
                inMemory.value = opts.default
            } else {
                localStorage.setItem(key, value)
                inMemory.value = value
            }
        }
    })
}
