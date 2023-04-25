import { Point2D } from "@src/utils/vectors";
import { throttle } from "lodash";
import { onMounted, onUnmounted, reactive, Ref, watch } from "vue";

export function useDragging(ref: Ref<HTMLElement>, opts: DraggingOpts) {

    const ctx = reactive({
        isHeld: false,
    })

    const normalizePoint = opts?.normalizePoint || getNormalizedPointOfEl

    function normalizeInputEvent(e: MouseEvent|TouchEvent) {
        return new MouseEventNormalized(e, normalizePoint(ref.value, e))
    }
    
    function beginDragging(e: MouseEvent|TouchEvent) {
        const result = opts.start?.(normalizeInputEvent(e), ctx)
        if (result === true) e.preventDefault()
        ctx.isHeld = true
    }
    let drag = function drag(e: MouseEvent|TouchEvent) {
        const result = opts.move?.(normalizeInputEvent(e), ctx)
        if (result === true) e.preventDefault()
    }
    if (opts.moveThrottle && opts.moveThrottle > 0) {
        drag = throttle(drag, opts.moveThrottle)
    }
    function stopDragging(e: MouseEvent|TouchEvent) {
        if (!isWithinRef(e, ref.value)) {
            opts.end?.(undefined, ctx)
        } else {
            const result = opts.end?.(normalizeInputEvent(e), ctx)
            if (result === true) e.preventDefault()
        }
        
        ctx.isHeld = false
    }
    function isWithinRef(e: MouseEvent|TouchEvent, el: HTMLElement): boolean {
        const {target} = e
        if (!(target instanceof Element)) return false

        return el?.contains(target)
    }

    onMounted(() => {
        watch(ref, (el, prevEl) => {
            el?.addEventListener('mousedown', beginDragging)
            prevEl?.removeEventListener('mousedown', beginDragging)
            el?.addEventListener('mousemove', drag)
            prevEl?.removeEventListener('mousemove', drag)

            window.addEventListener('mouseup', stopDragging)
            onUnmounted(() => window.removeEventListener('mouseup', stopDragging))

            el?.addEventListener('touchstart', beginDragging)
            prevEl?.removeEventListener('touchstart', beginDragging)
            el?.addEventListener('touchmove', drag)
            prevEl?.removeEventListener('touchmove', drag)

            el?.addEventListener('touchend', stopDragging)
            prevEl?.removeEventListener('touchend', stopDragging)

            // el?.addEventListener('touchstart', beginDragging)
            // prevEl?.removeEventListener('touchstart', beginDragging)
            // el?.addEventListener('touchmove', drag)
            // prevEl?.removeEventListener('touchmove', drag)
            // el?.addEventListener('touchend', stopDragging)
            // prevEl?.removeEventListener('touchend', stopDragging)
        }, {immediate: true})
    })
}

export function getNormalizedPointOfEl(el: HTMLElement, e: MouseEvent|TouchEvent): Point2D {
    const bounding = el.getBoundingClientRect()

    const x = e instanceof TouchEvent ? e.touches[0].pageX : e.pageX
    const y = e instanceof TouchEvent ? e.touches[0].pageY : e.pageY

    return [
        (x - window.scrollX - bounding.x) / bounding.width,
        (y - window.scrollY - bounding.y) / bounding.height,
    ]
}

export class MouseEventNormalized {
    constructor(public readonly original: MouseEvent | TouchEvent, public readonly point: Point2D) {
        
    }

    get isTouch() {
        return this.original instanceof TouchEvent
    }
    get x() {
        return this.point[0]
    }
    get y() {
        return this.point[1]
    }
}

type DraggingOpts = {
    normalizePoint?(el: HTMLElement, e: MouseEvent | TouchEvent): Point2D,

    start?: (e: MouseEventNormalized, ctx: DraggingEventCtx) => boolean | void,
    move?: (e: MouseEventNormalized, ctx: DraggingEventCtx) => boolean | void,
    end?: (e: MouseEventNormalized | undefined, ctx: DraggingEventCtx) => boolean | void,

    moveThrottle?: number,
}

type DraggingEventCtx = {
    isHeld: boolean,
}