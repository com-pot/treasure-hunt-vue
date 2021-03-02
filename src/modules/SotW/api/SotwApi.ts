import {PartOfStory} from "../model/SotwModel";

const storyParts: PartOfStory[] = [
    {
        storyPartId: 'story-prolog',
        storyTitle: "A je to",
        storyContent: 'Syčák od recepce do tý dýmky musel dát nějaký svinstvo, tohle přece nejsou Boskovice, anebo alespoň ne ve 2021'
    },
    {
        storyPartId: 'story-remedy',
        storyTitle: 'Auvej',
        storyContent: '<p>Šaman se na  %characters.protagonist.name% díval překvapeně a pak mu ukázal, že na výrobu léčivé' +
            ' masti musí smísit kousky vrbové kůry, květy byliny růžové barvy, která roste na nedalekých stráních,' +
            ' a přidat k tomu několik špetek lišejníku.<br/>' +
            ' Pořádně to vše rozdrtit v primitivním kamenném hmoždíři a smíchat s jílem v misce.' +
            ' Pak se otočil a řekl:</p>' +
            ' <blockquote>“Pokud dáš bylin málo, rána se zanítí a ani já ti už nebudu umět pomoct.' +
            ' Když jich dáš moc, tak ti jejich moc vezme dech a také zemřeš.<br/> Kůry musíš dát tolik co lovců dnes' +
            ' jelo na lov, květů tolik kolik koní si vzali s sebou a lišejníku tolik kolik mají koně kopyt.<br/>' +
            ' Celkem odjelo 22 hlav a 72 nohou.“</blockquote>'
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
            return {inputText: 'srics srsoc', check: '28f185a6'}
        }
        if (minigameId === 'bpc') {
            return {
                inputs: [
                    {name: 'bark', caption: 'Množství kůry'},
                    {name: 'petals', caption: "Počet květů"},
                    {name: 'moss', caption: "Kousků lišejníku"},
                ],
                check: '744b18',
            }
        }
        return ;
    }
}
