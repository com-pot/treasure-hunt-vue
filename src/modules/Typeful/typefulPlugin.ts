import {App} from "@vue/runtime-core"
import {TypefulAppModule} from "@src/modules/Typeful/defineTypefulModule"
import defaultTypefulModule from "@src/modules/Typeful/inputs/defaultTypefulModule"
import {createTypeRegistry} from "@src/modules/Typeful/typeRegistry"

const plugin = {
    install(vue: App, modules: TypefulAppModule[] = []) {
        const typeRegistry = createTypeRegistry(defaultTypefulModule , ...modules)
        vue.provide('typeful.typeRegistry', typeRegistry)
    },
}

export default plugin
