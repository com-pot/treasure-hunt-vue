import Universe from "@/modules/SotW/services/Universe"
import TextsService from "@/modules/SotW/services/TextsService"
import JsonApiAdapter from "@/modules/Api/services/JsonApiAdapter"
import SotwApi from "@/modules/SotW/api/SotwApi";
import AudioService from "@/modules/SotW/services/AudioService";
import authStore from "@/modules/Auth/authStore"

let apiAdapterInstance= new JsonApiAdapter(process.env.VUE_APP_API_BASE, authStore)
export const useApiAdapter = () => {
    return apiAdapterInstance
}
let sotwApiInstance: SotwApi
export const useSotwApi = () => {
    if (!sotwApiInstance) {
        sotwApiInstance = new SotwApi(useApiAdapter())
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
