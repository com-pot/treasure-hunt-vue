import {KnownSotwNode, PartOfStory} from "../model/SotwModel";
import CircularDominoApi from "@/modules/Minigames/components/CircularDomino/CircularDominoApi";
import JsonApiAdapter from "@/modules/Api/services/JsonApiAdapter";

const storyParts: PartOfStory[] = []
let storyPartsPromise: Promise<void>

const minigameDataLoaders: {[loader: string]: () => Promise<any>} = {
    anagram: () => Promise.resolve({inputText: 'byl naprdlo', outputLength: 'byl naprdlo '.length,  check: '28f185a6'}),
    password: () => Promise.resolve({prompt: "WHAT is your favourite colour?"}),
    zebraFoal: async () => ({
        zebras: (await import("./zebraFoalData.json")).zebras,
        check: 'aaaa'
    }),
    rings: async () => {
        return {
            rings: await CircularDominoApi.loadRings(),
            check: '4fad461c',
        }
    },
    mixMatch: () => import("./mixMatchMinigameData.json"),
    comboPick: () => Promise.resolve({
        check: '1995fa77',

        prompts: [
            {color: 'red'},
            {color: 'white'},
            {color: 'yellow'},
            {color: 'green'},
            {color: 'blue'},
            {color: '#808'},
        ],
        options: {
            default: [
                {value: 'n/a', label: 'žádný význam'},
                {value: 'shr', label: 'sdílení'},
                {value: 'mag', label: 'magie'},
                {value: 'int', label: 'intuice'},
                {value: 'rlg', label: 'víra'},
                {value: 'hea', label: 'léčení'},
                {value: 'itl', label: 'intelekt'},
            ],
            war: [
                {value: 'n/a', label: 'žádný význam'},
                {value: 'cnf', label: 'sebevědomí'},
                {value: 'enr', label: 'energie'},
                {value: 'end', label: 'vytrvalost'},
                {value: 'det', label: 'odhodlání'},
                {value: 'sor', label: 'smutek'},
            ],
        },
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
    }),
    bpc: () => Promise.resolve({
        inputs: [
            {name: 'bark', caption: 'Množství kůry'},
            {name: 'petals', caption: "Počet květů"},
            {name: 'moss', caption: "Kousků lišejníku"},
        ],
        check: '744b18',
    })
}

export default class SotwApi {

    constructor(private apiAdapter: JsonApiAdapter) {
    }

    ensureStoryPartsLoaded(): Promise<void> {
        if (storyParts.length) {
            return Promise.resolve()
        }
        if (storyPartsPromise) {
            return storyPartsPromise
        }

        return storyPartsPromise = this.apiAdapter.get("/treasure-hunt-story-parts")
            .then((apiModel) => {
                const localModel = (apiModel as any[]).map((part) => ({
                    storyPartId: part.storyPartId,
                    storyTitle: part.name,
                    storyContent: part.content,
                } as PartOfStory))

                storyParts.push(...localModel)
            })
    }

    async loadStoryTitles() {
        await this.ensureStoryPartsLoaded()
        return Object.fromEntries(storyParts.map((part) => [part.storyPartId, part.storyTitle]))
    }

    async loadStoryPart(storyPartId: string): Promise<PartOfStory> {
        await this.ensureStoryPartsLoaded()

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

    async loadPlayerProgression(): Promise<KnownSotwNode[]> {
        return this.apiAdapter.get('/treasure-hunt/my-progress')
    }

    async loadMinigameData(storyNodeId: string, challengeType: string): Promise<any> {
        if (challengeType in minigameDataLoaders) {
            return minigameDataLoaders[challengeType]()
        }

        this.apiAdapter.get('')

        console.debug("Minigame", challengeType, "does not have data")

        return null;
    }
}
