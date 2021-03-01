import SotwApi from "@/modules/SotW/api/SotwApi";
import {createContainer} from "@/di/container";
import Universe from "@/modules/SotW/services/Universe";
import JsonApiAdapter from "@/modules/Api/services/JsonApiAdapter";
import TextsService from "@/modules/SotW/services/TextsService";

const universeDefinition = {
    factory: () => new Universe({
        'characters.guide.name': 'Tir Zapa',
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
    textsService: {factory: (container => new TextsService(container.getService('universe')))}
});
