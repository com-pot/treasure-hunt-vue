type DateUnitDiff = {
    millis?: number,
    seconds?: number,
    minutes?: number,
    hours?: number,
    days?: number,
}
const msInUnit: Record<'second' | 'minute' | 'hour' | 'day', number> = {
    second: 0, minute: 0, hour: 0, day: 0
}
msInUnit.second = 1000
msInUnit.minute = msInUnit.second * 60
msInUnit.hour = msInUnit.minute * 60
msInUnit.day = msInUnit.hour * 24

const timeStamp = (source: Date|number): number => source instanceof Date ? source.getTime() : source
export const dateDiff = (target: Date|number, from?: Date|number): DateUnitDiff => {
    if (!from) {
        from = new Date()
    }

    let diff = timeStamp(target) - timeStamp(from)

    const result: DateUnitDiff = {}
    if (diff >= msInUnit.day) {
        result.days = Math.floor(diff / msInUnit.day)
        diff -= result.days * msInUnit.day
    }
    if (diff >= msInUnit.hour) {
        result.hours = Math.floor(diff / msInUnit.hour)
        diff -= result.hours * msInUnit.hour
    }
    if (diff >= msInUnit.minute) {
        result.minutes = Math.floor(diff / msInUnit.minute)
        diff -= result.minutes * msInUnit.minute
    }
    if (diff >= msInUnit.second) {
        result.seconds = Math.floor(diff / msInUnit.second)
        diff -= result.seconds * msInUnit.second
    }

    result.millis = diff

    return result
}
