export type PagedResult<T=any> = {
    page: number,
    perPage: number,
    total: number,
    items: T[],
}
