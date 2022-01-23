import {ref} from "vue"

export type ComponentStatus = 'loading' | 'ready' | 'error';

export const hasComponentStatus = (defaultValue: ComponentStatus = 'ready') => {
    return ref<ComponentStatus>(defaultValue)
}

export function resolvePromiseAsStatus<T extends object, K extends keyof T>(promise: Promise<any>, container: T, statusKey?: K) {
    const c = container as Record<K, ComponentStatus>
    const key = (statusKey || 'status') as keyof typeof c

    promise
        .then(() => {
            c[key] = 'ready'
        })
        .catch((err) => {
            c[key] = 'error'
            throw err
        })
}
