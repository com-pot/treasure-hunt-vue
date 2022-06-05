const termTemplate = /%((\w+\.)*\w+)%/g

export default class UniverseContent {
    private universe: Universe = emptyUniverse;

    public constructor() {

    }

    public initContent(universe: Universe | null) {
        this.universe = universe || emptyUniverse
    }

    public replaceTerms(input: string): string {
        return input.replaceAll(termTemplate, (match, term) => this.replaceTerm(term))
    }

    public replaceTerm(term: string): string {
        let text = this.universe.terms[term]
        if (!text) {
            console.warn(`Term ${term} is not available`);
            return '...'
        }
        return text;
    }
}

const emptyUniverse: Universe = {
    terms: {},
}

export type Universe = {
    terms: Record<string, string>,
}
