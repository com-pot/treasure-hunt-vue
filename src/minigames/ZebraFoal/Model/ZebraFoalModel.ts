import NeighborRule from "@/minigames/ZebraFoal/Model/ZebraNeighborRule";


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
