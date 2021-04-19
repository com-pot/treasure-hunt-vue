import {reactive, watch} from "vue";

type ResetAbleViewState<T extends object> = T & {resetState: () => void}

/**
 * Initializes view state via initValue fn and binds passed value from `prop` object by `key`.
 *
 * TODO: This function deserves more TypeScript love than I can currently offer. :/
 *
 * @param props - state value container object
 * @param key - name of property in container object
 * @param initValue - callback initializing default value
 */
export function useViewStateFromProps<T extends object, P extends object = any>(props: object, key: keyof P, initValue: () => T): ResetAbleViewState<T> {
    const viewState = reactive({
        ...initValue(),
        resetState: () => {
            Object.assign(viewState, initValue())
        },
    })

    watch(() => (props as any)[key], (value) => {
        if (!value) {
            return
        }
        if (typeof value !== "object") {
            console.warn("Non-object view state")
            return
        }

        Object.assign(viewState, value)
    }, {immediate: true})


    return viewState as unknown as ResetAbleViewState<T>
}
