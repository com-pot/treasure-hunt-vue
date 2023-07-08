import { describe, expect, it } from "vitest";
import { Point2D, pointsSum } from "./vectors";

describe('pointsSum', () => {
    const testCases: [Point2D, (number | Point2D)[]][] = [
        [
            [0, 0],
            []
        ],
        [
            [1, 1],
            [[1, 0], [0, 1]],
        ],
        [
            [6, 8],
            [2, [3, 4]],
        ],
        [
            [1, 1],
            [[1, 1], 2, 3, 4, 5],
        ],
        [
            [5, 10],
            [2, 2.5, [2, 1], 10, 0.5, [-1, 1]],
        ],
    ]

    testCases.forEach(([expectedPoint, sumArgs]) => it("sums " + JSON.stringify(sumArgs), () => {
        const result = pointsSum(...sumArgs)
        expect(result).to.deep.equal(expectedPoint)
    }))
})
