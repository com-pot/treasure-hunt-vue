export type InputSpec = {
    name: string,
    caption: string,
};

export type BpcMinigameData = {
    inputs: InputSpec[],
    check: string,
}

export type BpcViewState = {
    inputsModel: {[key: string]: number|string},
}
