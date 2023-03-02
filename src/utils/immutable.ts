import {Immer} from "immer"

const immerInstance = new Immer({
    autoFreeze: false,
})

export const immerMutable = immerInstance
export const produceMutable = immerInstance.produce
