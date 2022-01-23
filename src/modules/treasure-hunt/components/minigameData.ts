import {computed, ComputedRef, inject, provide, reactive, Ref} from "vue"
import {hashCode} from "@/utils/stringUtils"
import {CheckResult} from "../model/TreasureHuntModel"

type MinigameStatus = 'idle' | 'evaluating' | 'error' | 'success'

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

export function useMinigameData<T>(): ComputedRef<T> {
    const viewData = useViewData<any>()
    return computed<T>(() => viewData.value.challengeConfig)
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

export type MinigameControls<T = any> = {
    checkSolution: (solution?: string | any) => Promise<CheckResult>,
    status?: MinigameStatus,

    reset?: () => any,
    getValue?: () => T | Promise<T>,
}
export const normalizeValue = async (value?: string | number, getValue?: () => any): Promise<string> => {
    if (value === undefined) {
        if (!getValue) {
            return Promise.reject(new Error("Cannot try solution without value"))
        }
        let checkValue = getValue()
        if (checkValue instanceof Promise) {
            checkValue = await checkValue
        }
        if (typeof checkValue !== "string") {
            checkValue = JSON.stringify(checkValue)
        }
        value = hashCode(checkValue)
    }
    if (typeof value !== 'string') {
        value = hashCode(JSON.stringify(value))
    }

    return value
}

type CreateMinigameControlsOptions = {
    checkAnswer: (value: string) => Promise<CheckResult>
    evaluateResult?: (result: CheckResult) => MinigameStatus,
    provide?: boolean,
}
export const createMinigameControls = (opts: CreateMinigameControlsOptions): MinigameControls => {
    const minigameControls = reactive<MinigameControls>({
        status: 'idle',
        async checkSolution(value?: string) {
            minigameControls.status = 'evaluating'

            value = await normalizeValue(value, minigameControls.getValue)
            let result: CheckResult
            try {
                result = await opts.checkAnswer(value)
                minigameControls.status = opts.evaluateResult?.(result) || 'idle'
            } catch (err) {
                minigameControls.status = 'error'
                throw err
            }
            return result
        },
    })

    if (opts.provide) {
        provide('sotw.minigameControls', minigameControls)
    }

    return minigameControls
}

type MinigameControlsOptions<T = string> = {
    reset?: () => any,
    getValue?: () => T | Promise<T>,
}
export const useMinigameControls = <T>(options?: MinigameControlsOptions<T>): MinigameControls<T> => {
    const controls = inject<MinigameControls>('sotw.minigameControls')
    if (!controls) {
        throw new Error("No 'sotw.minigameControls' provided")
    }
    if (options) {
        controls.reset = options.reset
        controls.getValue = options.getValue
    }

    return controls
}
