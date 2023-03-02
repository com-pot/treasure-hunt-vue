export type BpcInputSpec = {
    name: string,
    caption: string,
};

export type BpcMinigameData = {
    inputs: BpcInputSpec[],
    check: string,
}

export type BpcViewState = {
    inputsModel: {[key: string]: number|string},
}
