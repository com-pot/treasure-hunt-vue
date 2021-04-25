import {Degrees} from "@/utils/trigonometry"

export interface Tile {
    bgColor: string,
    symbol: string,
}

export interface Stone {
    tiles: Tile[],
}

export interface Ring {
    stones: Stone[],
}

export type CircularDominoData = {
    rings: Ring[],
}
export type CircularDominoState = {
    ringsAngles: Degrees[],
}
