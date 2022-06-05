import {inject} from "vue"
import UniverseContent from "src/modules/treasure-hunt/components/UniverseContent"

export default () => inject('treasure-hunt.universeContent') as UniverseContent
