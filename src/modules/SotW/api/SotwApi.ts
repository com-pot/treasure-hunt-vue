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
                    slug: part.slug,
                    title: part.title || part.name, // TODO: remove this backward compatibility OR clause
                    contentHtml: part.contentHtml,
                    contentBlocks: part.contentBlocks,
                } as PartOfStory))

                storyParts.push(...localModel)
            })
    }

    async listStoryParts(story: string): Promise<PartOfStory[]> {
        return this.apiAdapter.get('/treasure-hunt/progression', {story})
    }

    async loadStoryPart(slug: string): Promise<PartOfStory> {
        await this.ensureStoryPartsLoaded()

        const part = storyParts.find((p) => p.slug === slug);
        if (!part) {
            console.error(`Story ${slug} has no content`);
            return {
                slug,
                title: 'story part #' + slug,
                contentHtml: "Story content for " + slug,
            }

            // return Promise.reject(`Story part '${slug}' could not be found`);
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
