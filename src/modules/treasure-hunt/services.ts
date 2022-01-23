import Universe from "./services/Universe"
import TextsService from "./services/TextsService"
import JsonApiAdapter from "@/modules/Api/services/JsonApiAdapter"
import TreasureHuntApi from "./api/TreasureHuntApi";
import AudioService from "./services/AudioService";
import authStore from "@/modules/Auth/authStore"

let apiAdapterInstance= new JsonApiAdapter(process.env.VUE_APP_API_BASE, authStore)
export const useApiAdapter = () => {
    return apiAdapterInstance
}
let sotwApiInstance: TreasureHuntApi
export const useSotwApi = () => {
    if (!sotwApiInstance) {
        sotwApiInstance = new TreasureHuntApi(useApiAdapter())
    }
    return sotwApiInstance
}

let universeInstance: Universe
export const useUniverse = () => {
    if (!universeInstance) {
        universeInstance = new Universe({
            'characters.guide.name': 'Tir Zapa',
            'characters.protagonist.name': '-[-hocha-]-',
            'company.casino.name': 'Gamble Tour',
        })
    }
    return universeInstance
}

let textsServiceInstance: TextsService
export const useTextsService = () => {
    if (!textsServiceInstance) {
        textsServiceInstance = new TextsService(useUniverse())
    }
    return textsServiceInstance
}

let sotwAudioInstance: AudioService
export const useSotwAudio = () => {
    if (!sotwAudioInstance) {
        sotwAudioInstance = new AudioService({
            minigameOk: '/audio/generic/ok.mp3',
            minigameKo: '/audio/generic/ko.mp3',
        }, 'sotw-audio')
    }

    return sotwAudioInstance
}
