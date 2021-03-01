import {expect} from "chai";

import trigonometry, {Radians} from "@/utils/trigonometry";

describe("trigonometry.ts", () => {
    let step = Math.PI / 10;
    let center = {x: 50, y: 50};

    function checkQuadrant(angleFrom: Radians, angleTo: Radians) {
        for (let angle = angleFrom; angle < angleTo; angle += step) {
            let p = trigonometry.circuitPosition(angle, 20, center.x, center.y);
            let pRad = trigonometry.angularPosition(p.x, p.y, center.x, center.y);

            expect(pRad.radius).to.be.closeTo(20, 0.0001);
            expect(pRad.angle).to.be.closeTo(angle, 0.0001);
        }

    }

    let piHalf = Math.PI / 2;
    ['I.', 'II.', 'III.', 'IV.'].forEach((label, i) => {
        it('self-checks ' + label + ' quadrant', () => checkQuadrant(i * piHalf, (i + 1) * piHalf));
    });
});
