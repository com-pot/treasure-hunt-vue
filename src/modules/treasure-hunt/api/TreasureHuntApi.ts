import {PartOfStory, ProgressionData} from "../model/TreasureHuntModel";
import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter";

export default class TreasureHuntApi {

    constructor(private apiAdapter: JsonApiAdapter) {
    }

    async listStoryParts(story: string): Promise<PartOfStory[]> {
        return this.apiAdapter.get('/treasure-hunt/progression', {story})
    }

    async loadProgressionData(slug: string): Promise<ProgressionData> {
        return this.apiAdapter.get("/treasure-hunt/progression/" + slug)
    }

    async checkAnswer(slug: string, answer: {checkSum: any}): Promise<any> {
        return this.apiAdapter.post(`/treasure-hunt/progression/${slug}/answer`, answer)
            .catch((err) => {
                if (err.body && err.body.error === 'already-solved') {
                    err.body.status = 'already-solved'
                    return err.body
                }
                throw err
            })
    }
}
