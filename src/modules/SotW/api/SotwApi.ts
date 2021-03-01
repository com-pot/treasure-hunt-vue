import {PartOfStory} from "../model/SotwModel";

const storyParts: PartOfStory[] = [
    {
        storyPartId: 'story-prolog',
        storyTitle: "A je to",
        storyContent: 'Syčák od recepce do tý dýmky musel dát nějaký svinstvo, tohle přece nejsou Boskovice, anebo alespoň ne ve 2021'
    },
    {
        storyPartId: 'story-anagram',
        storyTitle: "Scrics srsoc",
        storyContent: 'Tak jsem si myslel že si zahraju tu písmenkovou hru až se mi z toho zpřeházely písmena'
    },
];

export default class SotwApi {
    async loadStoryPart(storyPartId: string): Promise<PartOfStory> {
        const part = storyParts.find((p) => p.storyPartId === storyPartId);
        if (!part) {
            console.error(`Story ${storyPartId} has no content`);
            return {
                storyPartId,
                storyTitle: storyPartId,
                storyContent: "Story content for " + storyPartId,
            }

            // return Promise.reject(`Story part '${storyPartId}' could not be found`);
        }

        return Promise.resolve(part);
    }

    async loadMinigameData(minigameId: string): Promise<any> {
        if (minigameId === 'anagram') {
            return Promise.resolve({inputText: 'srics srsoc', check: '28f185a6'})
        }
        return ;
    }
}
