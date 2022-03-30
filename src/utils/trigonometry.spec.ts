import {describe, test, expect} from "vitest";

import trigonometry, {Radians} from "./trigonometry";

describe("Angular calculations", () => {

    describe("AngleRadius to XY to AngleRadius", () => {
        const piHalf = Math.PI / 2
        const step = Math.PI / 10
        const center = {x: 50, y: 50}

        function checkQuadrant(angleFrom: Radians, angleTo: Radians) {
            for (let angle = angleFrom; angle < angleTo; angle += step) {
                let p = trigonometry.circuitPosition(angle, 20, center.x, center.y)
                let pRad = trigonometry.angularPosition(p.x, p.y, center.x, center.y)

                expect(pRad.radius).to.be.closeTo(20, 0.0001)
                expect(pRad.angle).to.be.closeTo(angle, 0.0001)
            }
        }


        ['I.', 'II.', 'III.', 'IV.'].forEach((label, i) => {
            test('self-checks ' + label + ' quadrant', () => checkQuadrant(i * piHalf, (i + 1) * piHalf))
        });
    })

    describe("minAngleDiff", () => {
        const cases = [
            [0.1, 0.3, -0.2],
            [Math.PI * 2 + 0.1, Math.PI * 2 - 0.1, 0.2],
            [Math.PI * -2 + 0.1, Math.PI * -2 - 0.1, 0.2],
            [Math.PI * 2 - 0.1, Math.PI * -2 + 0.1, -0.2],
            [Math.PI * 2 - 0.1, Math.PI * -2 - 0.1, 0],
        ]
        cases.forEach(([a, b, expectedDiff]) => {
            test(`a: ${a}, b: ${b}`, () => {
                const diff = trigonometry.minAngleDiff(a, b)
                expect(diff).to.be.closeTo(expectedDiff, 0.0001)
            })
        })
    })
});
