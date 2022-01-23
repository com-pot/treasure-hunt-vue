import Universe from "./Universe";

export default class TextsService {
    constructor(private readonly universe: Universe) {
    }

    public replaceTerms(input: string): string {
        return input.replaceAll(/%((\w+\.)*\w+)%/g, (match, term) => this.replaceTerm(term));
    }

    public replaceTerm(term: string): string {
        let text = this.universe.getTerm(term);
        if (!text) {
            console.warn(`Term ${term} is not available`);
            return '...'
        }
        return text;
    }

}
