import {Radians} from "@/utils/trigonometry"

export interface Tile {
    bgColor: string,
    symbol: string,
    fgColor?: string,
}

export interface Stone {
    tiles: Tile[],
}

export type RingSideDrag = {[iRing: number]: number}
export interface Ring {
    stones: Stone[],
    sideDrag?: RingSideDrag,
}

export type CircularDominoData = {
    rings: Ring[],
}
export type CircularDominoState = {
    ringsAngles: Radians[],
}
