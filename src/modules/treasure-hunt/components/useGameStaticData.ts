import {inject} from "vue"
import {Universe} from "@src/modules/treasure-hunt/components/UniverseContent"

export default () => inject('treasure-hunt.game.staticData') as GameStaticData

export type GameStaticData = {
    title: string,
    intro?: string,

    universe?: Universe,
    trophyValues?: number[],
}
