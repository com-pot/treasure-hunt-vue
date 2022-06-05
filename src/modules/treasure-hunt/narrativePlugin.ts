import Vue from 'vue'
import UniverseContent from "./components/UniverseContent"

import gameStatic from "@custom/vlm/vlmGame.static.json"
import {GameStaticData} from "@src/modules/treasure-hunt/components/useGameStaticData"
// import gameStatic from "@custom/sotw/sotwGame.static.json"



export default {
    install(vue: Vue.App) {
        const gameData: GameStaticData = gameStatic
        vue.provide('treasure-hunt.game.staticData', gameData)

        const universeContent = new UniverseContent()
        universeContent.initContent(gameData.universe || null)
        vue.provide('treasure-hunt.universeContent', universeContent)
    },
}
