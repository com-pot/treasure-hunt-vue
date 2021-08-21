export function debounce<T extends Array<any>, U>(fn: (...args: T) => U, delay: number): (...args: T) => void {
    let timeout = -1

    return function (...args: T): void {
        if (timeout !== -1) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            timeout = -1
            fn.apply(undefined, args)
        }, delay)
    }
}
