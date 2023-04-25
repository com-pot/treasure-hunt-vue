export type Point2D = readonly [number, number]
export type Vector2D = readonly [number, number]

export function manhattanDistanceVec(a: Point2D, b: Point2D): Vector2D {
    return [a[0] - b[0], a[1] - b[1]]
}

export function pointsEqual(a: Point2D, b: Point2D) {
    return !!(a && b) && (a[0] === b[0] && a[1] === b[1])
}

export function pointMulIsolated(p: Point2D, b: Point2D): Point2D {
    return [p[0] * b[0], p[1] * b[1]]
}

export function pointsSum(...args: (number|Point2D)[]): Point2D {
    let sum: [number, number] = [0, 0]

    let c = 1
    for (let a of args) {
        if (typeof a === 'number') {
            c *= a
            continue
        }
        sum[0] += c * a[0]
        sum[1] += c * a[1]
        c = 1
    }
    return sum
}

export function vectorRatio(v: Vector2D): number {
    return v[0] / v[1]
}

export function joinPointToCss(p: Point2D, xName: string = '--x', yName: string = '--y') {
    return `${xName}: ${p[0]}; ${yName}: ${p[1]};`
}