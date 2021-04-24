type ComboPickPrompt = {
    img: string,
    options: string[],
}

export type ComboPickViewData = {
    options: {value: string}[],
    prompts: ComboPickPrompt[],
}
export type ComboPickState = {
    selections: (string|undefined)[],
}
