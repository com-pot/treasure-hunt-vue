import {Zebra} from "@/minigames/ZebraFoal/Model/ZebraFoalModel";

export type NeighborPosition = 'before' | 'after' | 'within';
export type RuleMaxDistance = number;
export type NeighborRuleEvaluator = (matchedZebras: Zebra[]) => boolean;
export type NeighborRule = [NeighborPosition, NeighborRuleEvaluator] | [NeighborPosition, RuleMaxDistance, NeighborRuleEvaluator];

export default NeighborRule;

export const NeighborPositions: NeighborPosition[] = ['before', 'after', 'within'];

const getRulePosition = (rule: NeighborRule): NeighborPosition => rule[0];
const getRuleOffset = (rule: NeighborRule): number => typeof rule[1] === "number" ? rule[1] : 0;
const getRuleEvaluator = (rule: NeighborRule): NeighborRuleEvaluator => rule.length === 3 ? rule[2] : rule[1];

export const matchZebras = (allZebras: Zebra[], zebraIndex: number, position: NeighborPosition, offset: number): Zebra[] => {
    let matchedZebras: Zebra[] = [];

    if (position === "before" || position === "within") {
        let start = offset === 0 ? 0 : Math.max(zebraIndex - offset, 0);
        matchedZebras.push(...allZebras.slice(start, zebraIndex));
    }
    if (position === "within" || position === "after") {
        let end = offset === 0 ? allZebras.length : zebraIndex + 1 + offset;
        matchedZebras.push(...allZebras.slice(zebraIndex + 1, end));
    }

    return matchedZebras;
}

export const NeighborRuleEvaluator = (allZebras: Zebra[], zebraIndex: number, rule: NeighborRule): boolean => {
    let position = getRulePosition(rule);
    let offset = getRuleOffset(rule);
    let evaluator = getRuleEvaluator(rule);

    let matchedZebras = matchZebras(allZebras, zebraIndex, position, offset);

    let result = evaluator(matchedZebras);

    if (!result) {
        console.debug("Evaluator failed for " + allZebras[zebraIndex].name, "due to ", evaluator);
    }

    return result;
}
