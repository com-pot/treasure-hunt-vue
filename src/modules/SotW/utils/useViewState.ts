import {inject, reactive, Ref} from "vue"

type ViewState<T, TData=any> = {
    value: T,
}

type ResetableViewState<T, TData extends object = any> = ViewState<T, TData> & {
    reset: (viewData: TData) => void,
}

export function useViewData<T>(): Ref<T>  {
    const viewData = inject<Ref<T>>('sotw.viewData')
    if (!viewData) {
        throw new Error("No 'sotw.viewData' provided")
    }

    return viewData
}

export type ViewStateInitializer<TData, TState> = ((viewData: TData, currentState?: TState) => TState)
export function useViewState(): ViewState<any>
export function useViewState<TState extends object, TData extends object = any>(init: ViewStateInitializer<TData, TState>, viewData?: Ref<TData>): ResetableViewState<TState>
export function useViewState<TState extends object, TData extends object = any>(init?: ViewStateInitializer<TData, TState>, viewData?: Ref<TData>)  {
    const stateValue = inject<Ref<TState>>('sotw.viewStateData')
    if (!stateValue) {
        throw new Error("No 'sotw.viewStateData' is not available")
    }

    const stateObj = reactive({
        value: stateValue
    }) as ViewState<TState>

    if (!init) {
        return stateObj
    }

    const resetableStateObj = stateObj as ResetableViewState<TState>
    resetableStateObj.reset = () => resetableStateObj.value = init(viewData?.value!) // FIXME: ts! oof

    if (!resetableStateObj.value) {
        resetableStateObj.reset(viewData?.value)
    }

    return resetableStateObj
}
