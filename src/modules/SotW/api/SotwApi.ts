import {KnownSotwNode, PartOfStory} from "../model/SotwModel";
import CircularDominoApi from "@/modules/Minigames/components/CircularDomino/CircularDominoApi";
import JsonApiAdapter from "@/modules/Api/services/JsonApiAdapter";

const storyParts: PartOfStory[] = []
let storyPartsPromise: Promise<void>

const minigameDataLoaders: {[loader: string]: () => Promise<any>} = {
    rings: async () => {
        return {
            rings: await CircularDominoApi.loadRings(),
        }
    },
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

        return storyPartsPromise = this.apiAdapter.get("/treasure-hunt/story-parts")
            .then((apiModel) => {
                const localModel = (apiModel as any[]).map((part) => ({
                    storyPartId: part.storyPartId,
                    title: part.title || part.name, // TODO: remove this backward compatibility OR clause
                    contentHtml: part.contentHtml,
                    contentBlocks: part.contentBlocks,
                } as PartOfStory))

                storyParts.push(...localModel)
            })
    }

    async loadStoryTitles() {
        await this.ensureStoryPartsLoaded()
        return Object.fromEntries(storyParts.map((part) => [part.storyPartId, part.title]))
    }

    async loadStoryPart(storyPartId: string): Promise<PartOfStory> {
        await this.ensureStoryPartsLoaded()

        const part = storyParts.find((p) => p.storyPartId === storyPartId);
        if (!part) {
            console.error(`Story ${storyPartId} has no content`);
            return {
                storyPartId,
                title: 'story part #' + storyPartId,
                contentHtml: "Story content for " + storyPartId,
            }

            // return Promise.reject(`Story part '${storyPartId}' could not be found`);
        }

        return Promise.resolve(part);
    }

    async saveStoryPart(id: string|null, storyPart: object): Promise<any> {
        return this.apiAdapter.put('/treasure-hunt/story-part/' + id, storyPart)
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
