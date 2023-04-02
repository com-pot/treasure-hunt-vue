import * as vectors from "@src/utils/vectors"
export * from "@src/utils/vectors"

export type CircuitOpening = {
    wire: {
        color: string,
    },
    ends: vectors.Point2D[],
}

export type CircuitBoard = {
    dimensions: vectors.Vector2D,
    display?: {
        size?: vectors.Vector2D,
        padding?: vectors.Vector2D,
    },
    openings: CircuitOpening[],
}

export type ShortCircuitConfig = {
    board: CircuitBoard,

    initState?: {
        paths?: BoardPath[],
    }
}

// State related types
export type BoardPath = {
    status?: 'draft' | 'receding',
    iOpening?: number,

    nodes: vectors.Point2D[],
}

export function pathIntersects(path: BoardPath, p: vectors.Point2D) {
    return path.nodes.find((node) => vectors.pointsEqual(p, node))
}

export function pathClosesOpening(path: BoardPath, opening: CircuitOpening): boolean {
    return opening.ends.every((end) => path.nodes.some((node) => vectors.pointsEqual(node, end)))
}

export function snipLoops(path: BoardPath) {
    function findAndSnip(): boolean {
        for (let iStart = 0; iStart < path.nodes.length; iStart++) {
            for (let iEnd = iStart + 1; iEnd < path.nodes.length; iEnd++) {
                if (!vectors.pointsEqual(path.nodes[iStart], path.nodes[iEnd])) continue
    
                path.nodes.splice(iStart, iEnd - iStart)
                snipped = true
            }
        }

        return false
    }

    let snipped = false
    do {
        snipped = findAndSnip()
    } while (snipped)
}