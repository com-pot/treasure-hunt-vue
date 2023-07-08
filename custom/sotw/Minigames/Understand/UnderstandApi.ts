import VocabularyEntry from "./Model/VocabularyEntry";

export default class UnderstandApi {

    public static async loadVocabulary(preset: string): Promise<VocabularyEntry[]> {
        console.log("loadVocabulary", preset)
        if (preset === 'fw') {
            const loaders = import.meta.globEager("../../../furrworld/assets/robo-calibration/*.png")
            const files = Object.entries(loaders)
                .map(([file, loader]): VocabularyEntry => {
                    const lastSlash = file.lastIndexOf('/')
                    const word = file.substring(lastSlash + 1)
                    return {word, pictureUrl: loader.default as string}
                })

            return files
        }

        return [
            {word: 'Pít', pictureUrl: '/minigames/understand/drink.png'},
            {word: 'Jít', pictureUrl: '/minigames/understand/walk.png'},
            {word: 'Jelen', pictureUrl: '/minigames/understand/deer.png'},
            {word: 'Spát', pictureUrl: '/minigames/understand/sleep.png'},
            {word: 'Tráva', pictureUrl: '/minigames/understand/grass.png'},
            {word: 'Bison', pictureUrl: '/minigames/understand/bison.png'},
            {word: 'Kůň', pictureUrl: '/minigames/understand/horse.png'},
            {word: 'Zřít', pictureUrl: '/minigames/understand/see.png'},
            {word: 'Dítě', pictureUrl: '/minigames/understand/baby.png'},
            {word: 'Jíst', pictureUrl: '/minigames/understand/eat.png'},
        ];
    }
}
