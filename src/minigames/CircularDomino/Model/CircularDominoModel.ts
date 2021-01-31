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
