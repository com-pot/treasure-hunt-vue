import {Zebra} from "./ZebraFoalModel";

export type NeighborPosition = 'before' | 'after' | 'within';
export type RuleMaxDistance = number;

type EvalDefinitionRule = 'includes' | '!includes' | string
type EvalDefinitionArgument = string
type NeighborRuleEvalDefinition = [EvalDefinitionRule, EvalDefinitionArgument]
type NeighborRuleEvaluatorFn = (matchedZebras: Zebra[]) => boolean

export type NeighborRuleEvaluator = NeighborRuleEvalDefinition | NeighborRuleEvaluatorFn;
export type NeighborRule = [NeighborPosition, NeighborRuleEvaluator] | [NeighborPosition, RuleMaxDistance, NeighborRuleEvaluator];

export default NeighborRule;

export const NeighborPositions: NeighborPosition[] = ['before', 'after', 'within'];

const predefinedEvaluators: {[name: string]: (matchedZebras: Zebra[], argument: any) => boolean} = {
    includes: (matchZebras,  argument) => matchZebras.some((zebra) => zebra.name === argument),
}

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

    return Array.isArray(evaluator)
        ? evaluatePredefined(matchedZebras, evaluator[0], evaluator[1])
        : evaluator(matchedZebras);
}
function evaluatePredefined(zebras: Zebra[], definitionName: string, argument: any): boolean {
    let expectedEvalResult = true;
    if (definitionName.charAt(0) === '!') {
        expectedEvalResult = false;
        definitionName = definitionName.substr(1);
    }

    let evaluator = predefinedEvaluators[definitionName];
    if (!evaluator) {
        console.warn(`No predefined evaluator '${definitionName}' exists`);
        return false;
    }

    return evaluator(zebras, argument) === expectedEvalResult;
}
