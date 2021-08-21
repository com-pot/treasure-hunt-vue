import {App} from "@vue/runtime-core"
import {InputRegistry} from "@/modules/Typeful/inputs/inputRegistry"

const plugin = {
    install(vue: App) {
        const inputRegistry: InputRegistry = require('./inputs/defaultInputRegistry').create()

        vue.provide('typeful.inputRegistry', inputRegistry)
    }
}

export default plugin