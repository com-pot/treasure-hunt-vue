import {PartOfStory} from "../model/SotwModel";
import CircularDominoApi from "@/modules/Minigames/components/CircularDomino/CircularDominoApi";
import JsonApiAdapter from "@/modules/Api/services/JsonApiAdapter";

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

    async listStoryParts(story: string): Promise<PartOfStory[]> {
        return this.apiAdapter.get('/treasure-hunt/progression', {story})
    }

    async loadStoryPart(slug: string): Promise<PartOfStory> {
        return this.apiAdapter.get("/treasure-hunt/progression/" + slug)
            .then((res: any) => res.storyPart)
    }

    async loadMinigameData(challengeId: string): Promise<any> {
        if (minigameDataLoaders[challengeId]) {
            return minigameDataLoaders[challengeId]()
        }

        return this.apiAdapter.get('/treasure-hunt/progression/' + challengeId)
            .then((result: any) => result.challenge)
    }

    async checkAnswer(slug: string, answer: {checkSum: any}): Promise<any> {
        return this.apiAdapter.post(`/treasure-hunt/progression/${slug}/answer`, answer)
    }
}
