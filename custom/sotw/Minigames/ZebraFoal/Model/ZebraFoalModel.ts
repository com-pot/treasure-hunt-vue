import NeighborRule from "./ZebraNeighborRule";


export type ZebraPositionRule = NeighborRule

export type Zebra = {
    name: string,
    rules: ZebraPositionRule[],
    helpText?: string,
}

export type ZebraSlot = {
    zebra?: Zebra,
    locked?: boolean,
    hasError?: boolean,
}


export type ZebraFoalViewState = {
    /** List of zebra names */
    placements: (string|null)[],
}
