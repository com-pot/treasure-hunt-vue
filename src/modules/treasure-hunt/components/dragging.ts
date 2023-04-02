import { Point2D } from "@src/utils/vectors";
import { throttle } from "lodash";
import { onMounted, onUnmounted, Ref, watch } from "vue";

export function useDragging(ref: Ref<HTMLElement>, opts: DraggingOpts) {

    function normalizeInputEvent(e: MouseEvent|TouchEvent) {
        const bounding = ref.value.getBoundingClientRect()
        const x = e instanceof TouchEvent ? e.touches[0].pageX : e.pageX
        const y = e instanceof TouchEvent ? e.touches[0].pageY : e.pageY
        
        return new MouseEventNormalized(e, [
            (x - bounding.x) / bounding.width,
            (y - bounding.y) / bounding.height,
        ])
    }
    
    function beginDragging(e: MouseEvent|TouchEvent) {
        e.preventDefault()
        opts.start(normalizeInputEvent(e))
    }
    let drag = function drag(e: MouseEvent|TouchEvent) {
        e.preventDefault()
        opts.move(normalizeInputEvent(e))
    }
    if (opts.moveThrottle && opts.moveThrottle > 0) {
        drag = throttle(drag, opts.moveThrottle)
    }
    function stopDragging(e: MouseEvent|TouchEvent) {
        if (!isWithinRef(e, ref.value)) {
            opts.end()
            return
        }
        
        e.preventDefault()
        opts.end(normalizeInputEvent(e))
    }
    function isWithinRef(e: MouseEvent|TouchEvent, el: HTMLElement): boolean {
        const {target} = e
        if (!(target instanceof Element)) return false

        return el.contains(target)
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

class MouseEventNormalized {
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
    start: (e: MouseEventNormalized) => void,
    move: (e: MouseEventNormalized) => void,
    end: (e?: MouseEventNormalized) => void,

    moveThrottle?: number,
}