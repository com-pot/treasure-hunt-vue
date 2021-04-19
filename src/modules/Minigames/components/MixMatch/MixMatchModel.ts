export type ColorOption = {label: string, color: string}
export type ModelOption = {name: string, image: string}
export type ModelOptionGroups = {
    [pieceType: string]: ModelOption[]
}

export type MixMatchMinigameData = {
    modelOptions: ModelOptionGroups,
    colorOptions: ColorOption[],
}


export type MixPieceType = 'head' | 'body' | 'leg'

export type MixPiece = {
    type: MixPieceType
    color: string,
    model: string,
}

export type MixMatchViewState = {
    pieces: MixPiece[],
}
