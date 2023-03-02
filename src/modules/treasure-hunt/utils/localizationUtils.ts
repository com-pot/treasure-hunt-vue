type PluralizeFn = (n: number) => String
export const pluralizeFn = (one: string, few: string, many: string): PluralizeFn => {
    const matchStringCs = (n: number) => {
        switch (true) {
            case n === 1: return one
            case n > 1 && n < 5: return few
            default: return many
        }
    }
    let pluralize = (n: number) => {
        if (n < 0) {
            return '-' + pluralize(-n)
        }

        let str = matchStringCs(n)
        return `${n} ${str}`
    }

    return pluralize
}

type LingualJoinFn = (items: string[]) => string

const joinNewArray = (items: string[]): string => lingualJoinInPlace(items.slice())
const lingualJoinInPlace = (items: string[]): string => {
    if (!items.length) {
        return ''
    }
    const end = items.pop()
    return (items.length ? items.join(', ') + ' a ' : '') + end
}
export const lingualJoin: LingualJoinFn & {inPlace: LingualJoinFn} = Object.assign(joinNewArray, {inPlace: lingualJoinInPlace})
