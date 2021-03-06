import SotwApi from "@/modules/SotW/api/SotwApi";
import {createContainer} from "@/di/container";
import Universe from "@/modules/SotW/services/Universe";
import JsonApiAdapter from "@/modules/Api/services/JsonApiAdapter";
import TextsService from "@/modules/SotW/services/TextsService";
import AudioService from "@/modules/SotW/services/AudioService";

const universeDefinition = {
    factory: () => new Universe({
        'characters.guide.name': 'Tir Zapa',
        'characters.protagonist.name': '-[-hocha-]-',
        'company.casino.name': 'Gamble Tour',
    })
};

export default createContainer({
    apiAdapter: {
        // TODO: Parametrize base url
        factory: () => new JsonApiAdapter('http://localhost'),
    },
    sotwApi: {factory: () => new SotwApi()},
    universe: universeDefinition,
    textsService: {factory: (container => new TextsService(container.getService('universe')))},
    sotwAudio: {
        factory: () => new AudioService({
            minigameOk: '/audio/generic/ok.mp3',
            minigameKo: '/audio/generic/ko.mp3',
        }, 'sotw-audio'),
    },
});
