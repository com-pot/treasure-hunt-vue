import { manhattanDistanceVec, Point2D, pointAdd, pointsEqual, Vector2D } from "./shortCircuit"

export function createCircuitLiner() {
    const snap = (l: number) => Math.sign(l)

    return {
        createShortest(a: Point2D, b: Point2D, lineOptions?: LineOptions, target?: Point2D[]) {
            if (!target) target = []
            const distances = manhattanDistanceVec(b, a)
                .map((l, dim) => ({dim, l, lAbs: Math.abs(l)}))

            const maxDiagonal = lineOptions?.maxDiagonal ?? Number.MAX_SAFE_INTEGER
            const maxLength = lineOptions?.maxLength ?? 256

            const maxDistanceDimension = findMaxDistance(distances)
            let lastStep: Vector2D = a.map((_, i) => i === maxDistanceDimension.dim ? snap(maxDistanceDimension.l) : 0) as any

            let currentPoint = a

            while (!pointsEqual(currentPoint, b)) {
                if (target.length >= maxLength) {
                    break
                }

                let step = manhattanDistanceVec(b, currentPoint)
                const minDiff = Math.min(...step.map((l) => Math.abs(l)))
                
                if (minDiff > maxDiagonal) step = lastStep
                else step = step.map((l) => snap(l)) as any
                

                currentPoint = pointAdd(currentPoint, step)

                target.push(currentPoint)

                lastStep = step
            }

            return target
        }, 
    }
}
export type CircuitLiner = ReturnType<typeof createCircuitLiner>

type LineOptions = {
    /** Defines maximum number of consecutive diagonal steps */
    maxDiagonal?: number,
    maxLength?: number,
}

type DimensionDistance = {
    dim: number,
    l: number, lAbs: number,
}
function findMaxDistance(distances: DimensionDistance[]): DimensionDistance {
    return distances
        .reduce((result, distance) => distance.lAbs > result.lAbs ? distance : result, distances[0])
}
