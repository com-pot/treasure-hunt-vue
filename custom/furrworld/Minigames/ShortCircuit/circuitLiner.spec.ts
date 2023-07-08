import { round } from "lodash";
import { describe, expect, it } from "vitest";
import { CircuitLiner, createCircuitLiner } from "./circuitLiner";
import { Point2D } from "./shortCircuit";

describe("circuitLiner", () => {
    const testCases: TestCase[] = [
        {
            start: [1, 1], end: [3, 3],
            expectedLineNodes: [
                [2, 2],
                [3, 3],
            ],
        },
        {
            start: [1, 1], end: [3, 3],
            maxDiagonal: 2,
            expectedLineNodes: [
                [2, 2],
                [3, 3],
            ],
        },
        {
            start: [1, 1], end: [3, 3],
            maxDiagonal: 1,
            expectedLineNodes: [
                [2, 1],
                [3, 2],
                [3, 3],
            ],
        }
    ]

    describe("whole numbers", () => {
        const liner = createCircuitLiner()
        runTestCases(liner, testCases)
    })
})

type TestCase = {
    start: Point2D, end: Point2D,
    maxDiagonal?: number,
    expectedLineNodes: Point2D[],
}

function runTestCases(liner: CircuitLiner, testCases: TestCase[]) {
    testCases.forEach((testCase, i) => {
        it("Passes test case #" + i.toString().padStart(2, '0'), () => {
            const line = liner.createShortest(testCase.start, testCase.end, {
                maxDiagonal: testCase.maxDiagonal,
            })

            expect(line).to.deep.equal(testCase.expectedLineNodes)
        })
    })
}
