import {expect} from "chai";

import {matchZebras, NeighborRuleEvaluator} from "./ZebraNeighborRule";
import {Zebra} from "./ZebraFoalModel";

describe("ZebraNeighborRule", () => {
    const zebras: Zebra[] = [
        {name: "Manny", rules: []},
        {name: "Sid", rules: []},
        {name: "Diego", rules: []},
        {name: "Ellie", rules: []},
    ];
    let zNames = (zebra: Zebra) => zebra.name;

    function expectNames(matched: Zebra[], names: string[]) {
        return expect(matched.map(zNames)).to.deep.equal(names);
    }

    describe("matches before", () => {
        it("at start", () => {
            let matched = matchZebras(zebras, 0, 'before', 0);
            expectNames(matched, []);
        });
        it("in the array", () => {
            let matched = matchZebras(zebras, 2, 'before', 0);
            expectNames(matched, ["Manny", "Sid"]);
        });
        it("with offset", () => {
            let matched = matchZebras(zebras, 3, 'before', 2);
            expectNames(matched, ["Sid", "Diego"]);
        });
    })

    describe("matches after", () => {
        it("at end", () => {
            let matched = matchZebras(zebras, 3, "after", 0);
            expectNames(matched, []);
        });

        it("in the array", () => {
            let matched = matchZebras(zebras, 1, 'after', 0);
            expectNames(matched, ["Diego", "Ellie"]);
        });
        it("with offset", () => {
            let matched = matchZebras(zebras, 0, 'after', 2);
            expectNames(matched, ["Sid", "Diego"]);
        });
    })

    describe("matches within", () => {
        for (let i = 0; i < zebras.length; i++) {
            let zebra = zebras[i];
            it("offset 0 around " + zebra.name, () => {
                let matched = matchZebras(zebras, i, "within", 0);
                let names = zebras.slice();
                names.splice(i, 1);
                expectNames(matched, names.map(zNames));
            });
        }

        let cases: [number, number, string[]][] = [
            [1, 1, ["Manny", "Diego"]],
            [1, 2, ["Manny", "Diego", "Ellie"]],
        ];
        cases.forEach(([zebraIndex, offset, expectedNames]) => {
            it(`zebra ${zebraIndex}, offset ${offset}`, () => {
                let matched = matchZebras(zebras, zebraIndex, "within", offset);
                expectNames(matched, expectedNames);
            })
        });
    })
})

describe("Predefined evaluator", () => {
    const zebras: Zebra[] = [
        { name: 'john', rules: []},
        { name: 'rose', rules: []},
        { name: 'dave', rules: []},
        { name: 'jade', rules: []},
    ];
    describe('existing evaluator', () => {
        it('Matches, positive', () => {
            let result = NeighborRuleEvaluator(zebras, 0, ['after', ["includes", "rose"]])
            expect(result).to.be.true;
        })
        it("Doesn't match, positive", () => {
            let result = NeighborRuleEvaluator(zebras, 0, ['after', ["includes", "karkat"]])
            expect(result).to.be.false;
        })
        it('Matches, negative', () => {
            let result = NeighborRuleEvaluator(zebras, 0, ['after', ["!includes", "bec"]])
            expect(result).to.be.true;
        })
        it("Doesn't match, positive", () => {
            let result = NeighborRuleEvaluator(zebras, 0, ['after', ["!includes", "dave"]])
            expect(result).to.be.false;
        })

    })

    it('does not match missing evaluator', () => {
        let result = NeighborRuleEvaluator(zebras, 0, ['after', ["sees", "vriska"]])
        expect(result).to.be.false;
    })
})
