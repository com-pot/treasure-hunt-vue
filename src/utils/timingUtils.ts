export function debounce<T extends Array<any>, U>(fn: (...args: T) => U, delay: number): (...args: T) => void {
    let timeout: ReturnType<typeof setTimeout>|null = null

    return function (...args: T): void {
        if (timeout !== null) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            timeout = null
            fn.apply(undefined, args)
        }, delay)
    }
}

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T
