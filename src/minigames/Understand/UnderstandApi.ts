import VocabularyEntry from "@/minigames/Understand/Model/VocabularyEntry";

export default class UnderstandApi {

    public static async loadVocabulary(): Promise<VocabularyEntry[]> {
        return [
            {word: 'Pít', pictureUrl: '/public/understand/drink.png'},
            {word: 'Jít', pictureUrl: '/public/understand/walk.png'},
            {word: 'Jelen', pictureUrl: '/public/understand/deer.png'},
            {word: 'Spát', pictureUrl: '/public/understand/sleep.png'},
            {word: 'Tráva', pictureUrl: '/public/understand/grass.png'},
            {word: 'Buffalo', pictureUrl: '/public/understand/buffalo.png'},
            {word: 'Kůň', pictureUrl: '/public/understand/horse.png'},
            {word: 'Zřít', pictureUrl: '/public/understand/see.png'},
            {word: 'Dítě', pictureUrl: '/public/understand/baby.png'},
            {word: 'Jíst', pictureUrl: '/public/understand/eat.png'},
        ];
    }
}
