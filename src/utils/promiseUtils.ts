export function resolveAfter(delay: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delay))
}
