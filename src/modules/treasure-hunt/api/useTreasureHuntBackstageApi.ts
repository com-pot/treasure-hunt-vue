import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"
import {PagedResult} from "@src/modules/Typeful/types/Collections"

export default (api: JsonApiAdapter) => {
    return {
        listPlayersByChallengeNumber(story: string) {
            return api.get(`/backstage/treasure-hunt/dashboard/story/${story}/players`)
                .then((res: any) => {
                    const list = res.players as PagedResult['items']
                    list.forEach((p) => {
                        if (!p.currentChallenge) {
                            p.currentChallenge = 0
                        }
                    })
                    list.sort((a, b) => b.currentChallenge - a.currentChallenge)
                    return list
                })
        },
    }
}
