import {PartOfStory} from "../model/SotwModel";
import {Zebra} from "@/modules/Minigames/components/ZebraFoal/Model/ZebraFoalModel";
import CircularDominoApi from "@/modules/Minigames/components/CircularDomino/CircularDominoApi";

const storyParts: PartOfStory[] = [
    {
        storyPartId: 'story-prolog',
        storyTitle: "No co to?",
        storyContent: 'Syčák od recepce do tý dýmky musel dát nějaký svinstvo, tohle přece nejsou Boskovice, anebo alespoň ne ve 2021'
    },
    {
        storyPartId: 'story-drums',
        storyTitle: 'Bum bum',
        storyContent: "",
    },
    {
        storyPartId: 'story-dreamcatcher',
        storyTitle: 'Lapače',
        storyContent: "",
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
    {storyPartId: 'story-totem', storyTitle: 'Totem', storyContent: "404: Příběh není k mání"},
    {storyPartId: 'story-tri-na-tri', storyTitle: 'Tři na tři', storyContent: "404: Příběh není k mání"},
    {storyPartId: 'story-pochop', storyTitle: 'Porozuměj', storyContent: "404: Příběh není k mání"},
    {
        storyPartId: 'story-samani',
        storyTitle: 'Šamani',
        storyContent: "<p>Nebude snadné usadit šamany ostatních kmenů, aby spolu vydrželi u jednoho ohně." +
            " Místo šamana kmene jelenů jakožto hostitele je jasné, ale ostatní? Dle toho co jsem zjistil tak :</p>" +
            "<ul><li>Medvědi se od nepaměti přátelí s vlky, ale pumy a buvoly jsou jejich nepřátelé.</li>" +
            "<li>Sovy byli vždy přáteli nás Jelenů a nikdy neměli v oblibě medvědy a lišky.</li>" +
            "<li>Pumy jsou známé tím že se s nikým výrazně nepřátelí pouze mají spory s liškami a sovami.</li>" +
            "<li>Naproti tomu vlci se snaží zavděčit pumám jak mohou a spřátelit se s nimi i za cenu toho že se tím dostaly do sporů s námi jeleny a bizony.</li>" +
            "<li>Díky tomu bizoni pohrdají podlézavými vlky a namyšlenými pumami a spřátelili se se sovami.</li></ul>" +
            "<p>Dýmka vždy koluje od hostitele ve směru hodinových ručiček a šaman bizonu by se urazil pokud by jí dostal před ním šaman medvědu…<br/" +
            "Jak si s tím  jen poradím ?</p>",
    },
    {
        storyPartId: 'story-epilog',
        storyTitle: 'Cool cool cool',
        storyContent: 'Tak zas někdy. <i>*mrk mrk*</i>'
    }
];

const zebras: Zebra[] = [
    {name: 'deer', helpText: '', rules: []},
    {
        name: 'bear',
        helpText: '',
        rules: [
            ["within", 1, ["includes", "wolf"]],
            ['within', 1, ["!includes", "cougar"]],
            ['within', 1, ["!includes", "bison"]],
        ],
    },
    {
        name: 'owl',
        helpText: '',
        rules: [
            ["within", 1, ["includes", "deer"]],
            ["within", 1, ["!includes", "bear"]],
            ["within", 1, ["!includes", "fox"]],
        ],
    },
    {
        name: 'cougar',
        helpText: '',
        rules: [
            ["within", 1, ["!includes", "fox"]],
            ["within", 1, ["!includes", "owl"]],
        ],
    },
    {name: 'fox', rules: []},
    {
        name: 'wolf',
        helpText: '',
        rules: [
            ["within", 1, ["includes", "cougar"]],
            ["within", 1, ["!includes", "deer"]],
            ["within", 1, ["!includes", "bison"]],
        ],
    },
    {
        name: 'bison',
        helpText: '',
        rules: [
            ["within", 1, ["!includes", "wolf"]],
            ["within", 1, ["!includes", "cougar"]],
            ["within", 1, ["includes", "owl"]],
            ["before", ["!includes", "bear"]],
        ],
    },


]

const minigameDataLoaders: {[loader: string]: () => Promise<any>} = {
    anagram: () => Promise.resolve({inputText: 'srics srsoc', check: '28f185a6'}),
    zebraFoal: () => Promise.resolve({ zebras, check: 'aaaa'}),
    rings: async () => {
        return {
            rings: await CircularDominoApi.loadRings(),
            check: '4fad461c',
        }
    },
    mixMatch: () => import("./mixMatchMinigameData.json"),
    comboPick: () => Promise.resolve({
        options: [
            {value: 'bear'},
            {value: 'bison'},
            {value: 'cougar'},
            {value: 'deer'},
            {value: 'fox'},
            {value: 'owl'},
            {value: 'wolf'},
        ],
        prompts: [
            {img: 'bear.png', options: ['bear', 'fox', 'wolf']},
            {img: 'deer.png', options: ['fox', 'deer', 'cougar', 'wolf']},
            {img: 'owl.png', options: ['wolf', 'bison', 'fox', 'cougar', 'bear', 'deer']},
        ],
    }),
    toggleMatrix: () => Promise.resolve({
        fields: [
            {row: 1, col: 1, label: 'A', key: 'albatros'},
            {row: 2, col: 1, label: 'B', key: 'boar'},
            {row: 1, col: 2, label: 'C', key: 'cicada'},
            {row: 3, col: 1, label: 'D', key: 'deer'},
            {row: 3, col: 3, label: 'E', key: 'emu'},
        ],
        check: 'boar-cicada-emu',
    })
}

export default class SotwApi {
    async loadStoryTitles() {
        return Object.fromEntries(storyParts.map((part) => [part.storyPartId, part.storyTitle]))
    }

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
        if (minigameId in minigameDataLoaders) {
            return minigameDataLoaders[minigameId]()
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

        console.debug("Minigame", minigameId, "does not have data")

        return null;
    }
}
