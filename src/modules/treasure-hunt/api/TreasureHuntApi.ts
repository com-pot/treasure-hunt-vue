import {ProgressionData} from "../model/TreasureHuntModel";
import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter";
import {PartOfStory} from "@src/modules/treasure-hunt/model/StoryPart"

export default class TreasureHuntApi {

    constructor(private apiAdapter: JsonApiAdapter) {
    }

    async listStoryParts(story: string): Promise<PartOfStory[]> {
        return this.apiAdapter.get('/treasure-hunt/progression', {story})
    }

    async loadProgressionData(slug: string): Promise<ProgressionData> {
        return this.apiAdapter.get("/treasure-hunt/progression/" + slug)
    }

    async checkAnswer(slug: string, answer: {block?: string|number, value: any}): Promise<any> {
        return this.apiAdapter.post(`/treasure-hunt/progression/${slug}/answer`, answer)
    }
}
