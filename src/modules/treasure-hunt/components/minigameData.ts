import {ComputedRef, inject, reactive, Ref, watch} from "vue"
import {hashCode} from "@src/utils/stringUtils"
import {CheckResult} from "../model/TreasureHuntModel"
import * as viewStateStore from "@src/modules/treasure-hunt/viewStateStore"

type MinigameStatus = 'idle' | 'evaluating' | 'error' | 'success'

type ViewStateRef<T> = {value: T}
export type ResetableRef<T, TData extends object = any> = ViewStateRef<T> & {
    reset: (viewData?: TData) => void,
}

export function createViewStateController(key: ComputedRef<string|null>) {
    const viewStateData = reactive({
        value: null,
        save() {
            if (key.value && viewStateData.value) {
                viewStateStore.actions.saveState(key.value, viewStateData.value)
            }
        },
        load() {
            viewStateData.value = key.value ? viewStateStore.actions.loadState(key.value) : null
        },
    })

    return viewStateData
}

export type ViewStateInitializer<TData, TState> = ((viewData: TData, currentState?: TState) => TState)
export function useViewState(): Ref<any>
export function useViewState<TState extends object, TData extends object = any>(init: ViewStateInitializer<TData, TState>, viewData?: Ref<TData>): ResetableRef<TState>
export function useViewState<TState extends object, TData extends object = any>(init?: ViewStateInitializer<TData, TState>, viewData?: Ref<TData>)  {
    if (viewData) {
        console.log("FIXME: Passing viewData through useViewState is deprecated")
    }
    const stateValue = inject<Ref<TState>|null>('th.viewStateData', null)

    const stateObj = reactive({
        value: null
    }) as ViewStateRef<TState>
    if (stateValue) {
        stateObj.value = stateValue.value
        watch(() => stateObj.value, (value) => stateValue.value = value, {immediate: true, deep: true})
    }

    if (!init) {
        return stateObj
    }

    const resetableStateObj = stateObj as ResetableRef<TState>
    resetableStateObj.reset = () => resetableStateObj.value = init(viewData?.value!) // FIXME: ts! oof

    if (!resetableStateObj.value) {
        resetableStateObj.reset(viewData?.value)
    }

    return resetableStateObj
}

export type MinigameControls<T = any> = {
    checkSolution: (blockId?: string|number|null, solution?: string | any) => Promise<CheckResult>,
    acceptMinigame: (options: MinigameControlsOptions) => void,
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
    checkAnswer: (block: number|string|null, value: string) => Promise<CheckResult>
    evaluateResult?: (result: CheckResult) => MinigameStatus,
}
export const createMinigameController = (opts: CreateMinigameControlsOptions): MinigameControls => {
    const minigameControls = reactive<MinigameControls>({
        status: 'idle',
        async checkSolution(block, solution) {
            minigameControls.status = 'evaluating'

            solution = await normalizeValue(solution, minigameControls.getValue)
            let result: CheckResult
            try {
                result = await opts.checkAnswer(block, solution)
                minigameControls.status = opts.evaluateResult?.(result) || 'idle'
            } catch (err) {
                console.error(err)
                minigameControls.status = 'error'
                return {status: 'ko'}
            }

            return result
        },

        acceptMinigame: (opts) => {
            minigameControls.reset = opts.reset
            minigameControls.getValue = opts.getValue
        },
    })

    return minigameControls
}

type MinigameControlsOptions<T = string> = {
    reset?: () => any,
    getValue?: () => T | Promise<T>,
}

export const minigameEmits = {
    'check-solution': (value: any) => true,
    'expose-minigame-controls': (controls: MinigameControlsOptions<any>) => true,
}

export const exposeMinigameControls = <T>(options: MinigameControlsOptions<T>, emitFn: any): MinigameControlsOptions<T> => {
    emitFn('expose-minigame-controls', options)
    return options
}
