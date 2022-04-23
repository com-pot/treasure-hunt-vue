import {get} from "lodash"

export type StringifySpec = string | {template: string}

export function stringify(item: any, stringify: StringifySpec): string | undefined {
    if (typeof stringify === 'string') {
        return toStr(get(item, stringify))
    }

    if (typeof stringify === 'object') {
        if (stringify.template) {
            return stringifyTemplate(stringify.template, item)
        }
    }

    console.warn("Unrecognized stringify", stringify)
    return undefined
}

const stringifyTemplateRegexp = /{{\s*([\w._]+)\s*}}/g
function stringifyTemplate(template: string, item: any): string {
    return template.replace(stringifyTemplateRegexp, (match, path) => {
        return toStr(get(item, path)) ?? '---'
    })
}

function toStr(val: any): string | undefined {
    if (val === undefined) {
        return undefined
    }
    if (val === null) {
        return ''
    }
    if(Array.isArray(val)) {
        return val.map(toStr).join(', ')
    }
    if (typeof val === 'object') {
        return JSON.stringify(val)
    }
    return val.toString()
}
