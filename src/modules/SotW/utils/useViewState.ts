import {inject, reactive, Ref, watch} from "vue"

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

type ViewState<T> = {
    value: T,
}

type ResetableViewState<T> = ViewState<T> & {
    reset: () => void,
}

export function useViewData<T>(): Ref<T>  {
    const viewData = inject<Ref<T>>('sotw.viewData')
    if (!viewData) {
        throw new Error("No 'sotw.viewData' provided")
    }

    return viewData
}

export function useViewState<T extends object>(): ViewState<T>
export function useViewState<T extends object>(init: () => T): ResetableViewState<T>
export function useViewState<T extends object>(init?: () => T)  {
    const stateValue = inject<Ref<T>>('sotw.viewStateData')
    if (!stateValue) {
        throw new Error("No 'sotw.viewStateData' is not available")
    }

    const stateObj = reactive({
        value: stateValue
    }) as ViewState<T>

    if (!init) {
        return stateObj
    }

    const resetableStateObj = stateObj as ResetableViewState<T>
    resetableStateObj.reset = () => resetableStateObj.value = init()

    if (!resetableStateObj.value) {
        resetableStateObj.reset()
    }

    return resetableStateObj
}
