type TermVocabulary = {[key: string]: string};

export default class Universe {

    constructor(private terms: TermVocabulary) {

    }

    getTerm(termId: string): string|null {
        if (termId in this.terms) {
            return this.terms[termId];
        }

        return null;
    }
}
