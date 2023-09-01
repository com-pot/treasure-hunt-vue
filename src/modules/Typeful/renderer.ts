import { computed } from "vue"

export function useRenderer() {
    const formatters = computed(() => {
        const locale = "cs"
        return {
            date: new Intl.DateTimeFormat(locale, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }),
            time: new Intl.DateTimeFormat(locale, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
        }
    })

    return {
        date(value: string | Date | undefined | null) {
            if (!value) return ""
            if (typeof value === "string") {
                value = new Date(value)
            }

            return formatters.value.date.format(value)
        },
        time(value: string | Date | undefined | null) {
            if (!value) return ""
            if (typeof value === "string") {
                value = new Date(value)
            }

            return formatters.value.time.format(value)
        },
    }
}
