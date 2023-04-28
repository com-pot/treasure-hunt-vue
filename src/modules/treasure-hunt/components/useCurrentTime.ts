import {onBeforeUnmount, onMounted, reactive} from "vue"
import {lingualJoin, pluralizeFn} from "@src/modules/treasure-hunt/utils/localizationUtils"
import {dateDiff} from "@src/modules/treasure-hunt/utils/timeUtils"

type CurrentTimeOptions<TFormatted> = {
    interval?: number,
    format?: (d: Date) => TFormatted,
}

export default <TFormatted=unknown>(opts?: CurrentTimeOptions<TFormatted>) => {
    const date = new Date()

    const currentTime = reactive({
        time: date.getTime(),
        formatted: opts?.format?.(date),
    })

    let interval: ReturnType<typeof setInterval>
    onMounted(() => {
        interval = setInterval(() => {
            currentTime.time = date.setTime(Date.now())
            if (opts?.format) {
                currentTime.formatted = opts.format(date) as any
            }
        }, opts?.interval ?? 1000)
    })
    onBeforeUnmount(() => {
        clearInterval(interval)
        interval = undefined
    })

    return  currentTime
}

const printUnitOrder = ['days', 'hours', 'minutes', 'seconds']
export const timePrint = Object.freeze({
    pluralize: {
        seconds: pluralizeFn("vteřina", "vteřiny", "vteřin"),
        minutes: pluralizeFn("minuta", "minuty", "minut"),
        hours: pluralizeFn("hodina", "hodiny", "hodin"),
        days: pluralizeFn("den", "dny", "dní"),
        months: pluralizeFn("měsíc", "měsíce", "měsíců"),
        years: pluralizeFn("rok", "roky", "let"),
    },
    pluralize4thCase: {
        seconds: pluralizeFn("vteřinu", "vteřiny", "vteřin"),
        minutes: pluralizeFn("minutu", "minuty", "minut"),
        hours: pluralizeFn("hodinu", "hodiny", "hodin"),
        days: pluralizeFn("den", "dny", "dní"),
        months: pluralizeFn("měsíc", "měsíce", "měsíců"),
        years: pluralizeFn("rok", "roky", "let"),
    },

    dateDiffUnits: (target: Date, from?: Date, opts?: DateDiffUnitsOpts): string => {
        const diff = dateDiff(target, from || new Date())

        const casing = opts?.czechCase === 1 ? timePrint.pluralize : timePrint.pluralize4thCase

        const parts = (opts?.units || printUnitOrder)
            .map((unit) => {
                let amount = diff[unit]
                return !amount ? null : casing[unit](amount)
            })
            .filter((p) => (p))

        return lingualJoin.inPlace(parts)
    },
})

type DateDiffUnitsOpts = {
    units?: string[],
    czechCase?: 1 | 4,
}
