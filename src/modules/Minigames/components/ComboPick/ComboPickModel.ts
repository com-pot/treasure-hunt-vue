type ComboPickPrompt = {
    color: string,
    options?: string[],
}

export type ComboPickViewData = {
    prompts: ComboPickPrompt[],
    options: {[key: string]: string[]},
}
export type ComboPickState = {
    selections: ((string|undefined)[])[],
}

export

const isValidSelection = (value: any): boolean => {
    return !(!value || !Array.isArray(value) || value.length !== 2);
}

export const initializeState = (viewData: ComboPickViewData, currentState?: ComboPickState) => {
    if (!currentState) {
        return {
            selections: viewData.prompts.map(() => ['n/a', 'n/a']),
        }
    }

    return normalizeStoredState(currentState, viewData)
}

export const normalizeStoredState = (state: ComboPickState, viewData: ComboPickViewData): ComboPickState  => {
    if (!state.selections) {
        state.selections = []
    }
    viewData.prompts.forEach((p, i) => {
        if (!isValidSelection(state.selections[i])) {
            state.selections[i] = ['', '']
        }
    })
    return state
}