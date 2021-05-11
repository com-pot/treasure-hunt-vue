import {inject, reactive, Ref} from "vue"

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
