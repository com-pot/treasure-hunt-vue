import { computed } from "vue";
import { useRoute } from "vue-router";

type RouteAccessorOpts = {
    // cacheQuery?: boolean | {
    //     ignore?: string[],
    // },
    pageParamName?: string,

    defaults?: Record<string, string>,
}
export function useRouteAccessor(opts?: RouteAccessorOpts) {
    const route = useRoute()
    
    const defaults = opts?.defaults || {}
    if (opts?.pageParamName) {
        defaults[opts.pageParamName] = "1"
    }

    // const map = opts?.cacheQuery ? new Map() : null
    // const cacheIgnore = typeof opts?.cacheQuery === "object" && opts.cacheQuery.ignore || []
    // const shouldCache = (name: string) => !cacheIgnore.some((ignore) => ignore === name)

    function querySingle(name: string) {
        let value = route.query[name]
        if (!value && defaults[name]) value = defaults[name]
        
        // if (!value) {
        //     if (map?.has(name)) value = map.get(name)
        // } else {
        //     shouldCache(name) && map?.set(name, value)
        // }

        if (Array.isArray(value)) value = value[0]
        return value
    }
    const query = {
        getString: (name: string): string | null => {
            const single = querySingle(name)

            return single
        },
        getNumber(name: string): number | null {
            const single = querySingle(name)
            const val = Number(single)
            if (!Number.isFinite(val)) return null

            return val
        },
    }

    const page = computed(() => {
        if (!opts?.pageParamName) return 0
        return query.getNumber(opts.pageParamName) ?? 1
    })

    function withQuery(params: Record<string, string | number | undefined>) {
        const query = {...route.query, ...params}
        for (let key of Object.keys(query)) {
            if (query[key] === defaults[key]) delete query[key]
        }

        return {
            path: route.path,
            query,
        }
    }

    return {
        route,

        query,
        defaults: opts?.defaults || {},
        withQuery,

        page,
        withPage(page: number) {
            return withQuery({
                [opts?.pageParamName || "stranka"]: page,
            })
        },
    }
}
