import {computed, reactive} from "vue"
import {TimeoutData} from "@src/modules/treasure-hunt/model/TreasureHuntModel"

type TimeoutStatus = 'invalid' | 'ticking' | 'expired'
export type PlayerTimeout = {
    start?: Date,
    end?: Date,
    now: number,

    status: TimeoutStatus
    duration?: number,

    timeLeft?: number,

    timeElapsed?: number,
    pctElapsed?: number,

    applyFrom: (data: TimeoutData) => void,
}

const isValidDate = (d?: Date): d is Date => {
    return !!d && Number.isSafeInteger(d.getDate())
}

export const useTimeout = (): PlayerTimeout => {
    const timeout: PlayerTimeout = reactive({
        start: undefined,
        end: undefined,
        now: Date.now(),

        timeLeft: computed<number | undefined>(() => {
            if (!isValidDate(timeout.end) || !timeout.now) {
                return
            }
            const remainingMillis = timeout.end.getTime() - timeout.now
            return Math.max(0, remainingMillis)
        }),
        status: computed<TimeoutStatus>(() => {
            if (timeout.timeLeft === undefined) {
                return 'invalid'
            }
            return timeout.timeLeft > 0 ? 'ticking' : 'expired'
        }),

        timeElapsed: computed<number | undefined>(() => {
            if (!isValidDate(timeout.start) || !timeout.now) {
                return
            }

            const passedMillis = timeout.now - timeout.start.getTime()
            return Math.max(0, passedMillis)
        }),
        pctElapsed: computed<number | undefined>(() => {
            if (!isValidDate(timeout.start) || !isValidDate(timeout.end) || !timeout.now) {
                return
            }

            const totalDuration = timeout.end.getTime() - timeout.start.getTime()
            const elapsed = timeout.now - timeout.start.getTime()
            if (totalDuration <= 0) {
                return
            }
            if (elapsed < 0) {
                return 0
            }

            return Math.min(elapsed / totalDuration, 1)
        }),

        applyFrom: (data?: TimeoutData|null) => {
            timeout.start = data?.since ? new Date(data.since) : undefined
            timeout.end = data?.until ? new Date(data.until) : undefined
        },
    })

    return timeout
}
