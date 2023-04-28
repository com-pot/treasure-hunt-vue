import { clamp, round } from "lodash";
import { computed, reactive, ref } from "vue";
import { BoardPath, CircuitBoard, pathClosesOpening, pathIntersects, Point2D, pointsEqual } from "./shortCircuit";


export function createaShortCircuitVueController(board: CircuitBoard) {
    const paths = ref<BoardPath[]>([])
    const draft = computed<BoardPath>({
        get: () => paths.value.find((path) => path.status === 'draft'),
        set: (path) => {
            if (path && paths.value.find((path) => path.status === 'draft')) {
                return console.warn("Board already has one draft");
            }
            if (!path) {
                paths.value = paths.value.filter((path) => path.status !== 'draft')
                return
            }
            paths.value = [
                ...paths.value,
                {
                    ...path,
                    status: 'draft',
                },
            ]
        },
    })

    const openingsList = computed(() => {
        const entries: [Point2D, OpeningEndpointRef][] = []
        board.openings.forEach((opening, iOpening) => {
            opening.ends.forEach((endPoint, iEndPoint) => entries.push([endPoint, {iOpening, iEndPoint}]))
        })

        return entries
    })

    const activePaths = computed(() => paths.value.filter((path) => !path.status))

    const find = {
        pathIndexAtPoint(p: Point2D) {
            return paths.value.findIndex((path) => !path.status && pathIntersects(path, p))
        },
        looseEnd(p: Point2D) {
            for (let [i, opening] of board.openings.entries()) {
                if (activePaths.value.some((path) => pathClosesOpening(path, opening))) continue
                
                const ep = opening.ends.find((point) => pointsEqual(p, point))
                if (ep) return { i, p }
            }
        },
        pathPointIndex(path: BoardPath, point?: number | Point2D): number {
            let index = typeof point === 'number' ? point : path.nodes.length
            if (point && typeof point === 'object') {
                const p = point
                index = path.nodes.findIndex((node) => pointsEqual(node, p))
            }
            if (index < 0 || index > path.nodes.length) {
                index = path.nodes.length
            }
            
            return index
        },
    }

    const mutate = {
        addPath(path: BoardPath) {
            paths.value.push({...path, status: undefined})
        },
        removePath(subject: number, slicePoint?: number | Point2D) {
            const removePath = paths.value[subject]
            paths.value = paths.value.filter((_, i) => i !== subject)   

            const iSlice = find.pathPointIndex(removePath, slicePoint)
            const start = removePath.nodes.slice(0, iSlice)
            const end = removePath.nodes.slice(iSlice + 1).reverse()

            start.length && paths.value.push({nodes: start, status: 'receding'})
            end.length && paths.value.push({nodes: end, status: 'receding'})
        },

        cutExistingWires(slicer: BoardPath, slicerFrom?: number, slicerTo?: number) {
            if (!slicerFrom) slicerFrom = 0
            if (!slicerTo) slicerTo = slicer.nodes.length - 1
            for (let i = slicerFrom; i <= slicerTo; i++) {
                const slicerNode = slicer.nodes[i]
                paths.value.forEach((path, iPath) => {
                    if (path.status) return
                    const iSlicePoint = path.nodes.findIndex((node) => pointsEqual(node, slicerNode))
                    if (iSlicePoint !== -1) mutate.removePath(iPath, iSlicePoint)
                    return
                })
            }
        },
        checkDraftClosings(previousLength?: number, mode?: 'auto-close') {
            for (let i = previousLength ?? 1; i < draft.value.nodes.length; i++) {
                const pCheck = draft.value.nodes[i]
                const endPointRef = openingsList.value.find(([point]) => pointsEqual(point, pCheck))
                if (!endPointRef) continue

                const [point, ref] = endPointRef

                if (draft.value.iOpening !== ref.iOpening) {
                    draft.value.status = 'receding'
                    return 'snap-error'
                }

                if (mode === 'auto-close' && pathClosesOpening(draft.value, board.openings[draft.value.iOpening])) {
                    draft.value.status = null
                    return 'snap-ok'
                }
            }
        },
    }

    const view = {
        size: board.display?.size ?? board.dimensions,
        padding: board.display?.padding ?? [0, 0],

        point(value: number, dimension: number) {
            return value * (this.size[dimension] - this.padding[dimension] * 2) + this.padding[dimension]
        },
    }
    

    function snap(p: Point2D): Point2D {
        return p.map((normValue, dim): number => {
            const normWithouthPadding = ((normValue * view.size[dim] - view.padding[dim])) / (view.size[dim] - view.padding[dim] * 2)
            const pointInBoard = normWithouthPadding * board.dimensions[dim]

            return clamp(round(pointInBoard), 0, board.dimensions[dim])
        }) as unknown as Point2D
        
    }

    const display = {
        stdPoint: (n: number, dim: 0 | 1) => round(view.point((n) / board.dimensions[dim], dim), 3),

        pointSvg: (p: Point2D) => `${round(view.point(p[0] / board.dimensions[0], 0), 4)},${round(view.point(p[1] / board.dimensions[1], 1), 4)}`,
        pathSvg: (path: BoardPath) => {
            if (!path.nodes.length) return ''
            const sliced = path.nodes.slice()
            const segments: string[] = []
        
            const start = sliced.shift()
            segments.push(`M ${display.pointSvg(start)}`)
            sliced.forEach((p) => segments.push(`L ${display.pointSvg(p)}`))
            
            return segments.join('\n')
        },
    }

    const boardState = reactive({
        openingsClosed: computed((): boolean[] => board.openings.map((opening) => !!activePaths.value.find((path) => pathClosesOpening(path, opening)) )),
        allClosed: computed((): boolean => boardState.openingsClosed.every(Boolean)),
    })

    const status = computed(() => {
        if (boardState.allClosed) return 'done'
        if (paths.value.some((path) => path.status === 'receding')) {
            return 'busy'
        }
        return 'idle'
    })

    const toRemove: number[] = []
    function update() {
        toRemove.splice(0)
        for (let i = 0; i < paths.value.length; i++) {
            const path = paths.value[i]
            if (path.status === 'receding') {
                path.nodes.pop()
                if (!path.nodes.length) {
                    toRemove.push(i)
                }
            }
        }
        
        if (toRemove.length) {
            paths.value = paths.value.filter((_, i) => !toRemove.includes(i))
        }
    }

    const ctrl = reactive({
        board,

        paths,
        draft,

        snap,
        find,
        display,
        mutate,

        boardState,
        status,

        update,

        view,
    })

    return ctrl
}

type OpeningEndpointRef = {
    iOpening: number,
    iEndPoint: number,
}
