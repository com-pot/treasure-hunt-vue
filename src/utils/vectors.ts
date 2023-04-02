export type Point2D = readonly [number, number]
export type Vector2D = readonly [number, number]

export function manhattanDistanceVec(a: Point2D, b: Point2D): Vector2D {
    return [a[0] - b[0], a[1] - b[1]]
}

export function pointsEqual(a: Point2D, b: Point2D) {
    return !!(a && b) && (a[0] === b[0] && a[1] === b[1])
}
export function pointAdd(a: Point2D, d: Vector2D): Point2D {
    return [a[0] + d[0], a[1] + d[1]]
}
