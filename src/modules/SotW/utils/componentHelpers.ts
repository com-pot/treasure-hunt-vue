import {ref} from "vue"

export type ComponentStatus = 'loading' | 'ready' | 'error';

export const hasComponentStatus = (defaultValue: ComponentStatus = 'ready') => {
    return ref<ComponentStatus>(defaultValue)
}
