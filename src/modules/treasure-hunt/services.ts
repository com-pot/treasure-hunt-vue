import { watch } from "vue";

import Universe from "./services/Universe"
import TextsService from "./services/TextsService"
import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"
import TreasureHuntApi from "./api/TreasureHuntApi";
import AudioService from "./services/AudioService";
import authStore from "@src/modules/Auth/authStore"

let apiAdapterInstance = new JsonApiAdapter(import.meta.env.VITE_API_BASE + '')
watch(() => authStore.state.user.value, (user) => {
    if (!user) {
        delete apiAdapterInstance.defaultHeaders.Authorization
    } else {
        apiAdapterInstance.defaultHeaders.Authorization = 'Bearer ' + user.token
    }
}, {immediate: true})
authStore.actions.bindApiAdapter(apiAdapterInstance)

export const useApiAdapter = () => {
    return apiAdapterInstance
}

export const useTreasureHuntApi = () => {
    return new TreasureHuntApi(useApiAdapter())
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
