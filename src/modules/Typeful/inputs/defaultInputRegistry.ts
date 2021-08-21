import Multiselect from "@vueform/multiselect"

import {InputRegistry} from "@/modules/Typeful/inputs/inputRegistry"

import "@vueform/multiselect/themes/default.scss"

export const create = (): InputRegistry => {
    const inputRegistry: InputRegistry = new Map()
    inputRegistry.set('select', Multiselect)

    return inputRegistry
}