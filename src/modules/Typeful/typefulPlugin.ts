import {App} from "@vue/runtime-core"
import {InputRegistry} from "@src/modules/Typeful/inputs/inputRegistry"
import * as defaultInputRegistry from './inputs/defaultInputRegistry'

const plugin = {
    install(vue: App) {
        const inputRegistry: InputRegistry = defaultInputRegistry.create()

        vue.provide('typeful.inputRegistry', inputRegistry)
    }
}

export default plugin