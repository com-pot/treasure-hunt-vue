import {defineCustomElement} from "vue"

import mgModule from '../src/modules/treasure-hunt/Minigames/ToggleMatrix/ToggleMatrixComponent.vue'
const moduleCe = defineCustomElement(mgModule)

customElements.define('mg-toggles', moduleCe)
