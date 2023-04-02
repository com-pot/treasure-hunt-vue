<script lang="ts" setup>
import { computed, PropType, ref, onMounted, onBeforeUnmount } from 'vue';
import { useTransition } from "@vueuse/core";
import { useDragging } from "@src/modules/treasure-hunt/components/dragging"
import { Point2D, Vector2D, ShortCircuitConfig, pathClosesOpening, snipLoops } from './shortCircuit'
import { createaShortCircuitVueController } from "./shortCircuitVueController"
import { useGameLoop } from '@src/modules/treasure-hunt/components/gameLoop';

import { createCircuitLiner } from './circuitLiner';

const emit = defineEmits({
    'check-solution'(value: string | number) {
        return !!value
    },
})

const props = defineProps({
    challengeConfig: {type: Object as PropType<ShortCircuitConfig>, required: true},
})

const ctrl = createaShortCircuitVueController(props.challengeConfig.board)
if (import.meta.env.DEV && props.challengeConfig.initState?.paths) {
    // Regex for compact point formatting
    //  \[\n\s+(\d+),\n\s+(\d+)\n\s+\]
    ctrl.paths = props.challengeConfig.initState.paths
}


const pathsSvg = computed(() => ctrl.paths.map((path) => ctrl.display.pathSvg(path)))

const cursor = ref<Point2D>([0, 0])
const cursorVisible = ref(false)

const cursorLocationStr = computed(() => `[${cursor.value[0].toString().padStart(3, ' ')};${cursor.value[1].toString().padStart(3, ' ')}}]`)
const cursorVecSmooth = useTransition(cursor as unknown as number[], {duration: 50})
const cursorSize = ref<Vector2D>([0.15, 0.15])
const activePathIndex = computed(() => ctrl.find.pathIndexAtPoint(cursor.value))


const openingSize = ref(0.1)

const boardEl = ref<HTMLElement>()
const circuitLiner = createCircuitLiner()
const lineOptions: Parameters<typeof circuitLiner['createShortest']>[2] = {
    maxDiagonal: 1,
}


const drag = useDragging(boardEl, {
    moveThrottle: 100,

    start(e) {
        const point = ctrl.snap([e.x, e.y])

        let removePathIndex = e.isTouch ? ctrl.find.pathIndexAtPoint(point) :  activePathIndex.value
        
        if (removePathIndex !== -1) {
            ctrl.mutate.removePath(removePathIndex, point)
            return
        }
        if (ctrl.status !== 'idle') return

        let looseEnd = ctrl.find.looseEnd(point)
        if (!looseEnd) {
            return
        }
        
        ctrl.draft = {
            iOpening: looseEnd.i,

            nodes: [
                looseEnd.p,
            ],
        }
    },
    move(e) {
        const currentPoint = cursor.value = ctrl.snap([e.x, e.y])
        cursorVisible.value = !e.isTouch
        if (!ctrl.draft) return

        const currentLength = ctrl.draft.nodes.length
        circuitLiner.createShortest(ctrl.draft.nodes.at(-1), currentPoint, lineOptions, ctrl.draft.nodes)
        snipLoops(ctrl.draft)
        ctrl.mutate.cutExistingWires(ctrl.draft, currentLength)

        const snapResult = ctrl.mutate.checkDraftClosings(currentLength)
        if (snapResult === 'snap-error') {
            emit('check-solution', 'buzz')
        }
    },
    end(e) {
        if (!ctrl.draft) return
        const opening = ctrl.board.openings[ctrl.draft.iOpening]
        const draft = ctrl.draft
        ctrl.draft = null
        
        ctrl.mutate.addPath(draft)

        if (!pathClosesOpening(draft, opening)) {
            ctrl.mutate.removePath(ctrl.paths.length - 1)
            return
        }

        if (ctrl.boardState.allClosed) {
            emit('check-solution', ctrl.boardState.openingsClosed.length)
        }
    },
})

const gameLoop = useGameLoop(10, () => {
    ctrl.update()
})
onMounted(() => gameLoop.start())
onBeforeUnmount(() => gameLoop.stop())

</script>

<template>
    <div class="mg -short-circuit">
        <div>
            {{ ctrl.status }}
            {{ ctrl.boardState }}
        </div>
        
        <svg :viewBox="`0 0 ${ctrl.view.size[0]} ${ctrl.view.size[1]}`" xmlns:svg="http://www.w3.org/2000/svg"
            class="board" :style="`--w: ${ctrl.view.size[0]}; --h: ${ctrl.view.size[1]};`"

            ref="boardEl" 
        >
            <rect class="bg" x="0" y="0" :width="ctrl.view.size[0]" :height="ctrl.view.size[1]" />
            <template v-for="opening of ctrl.board.openings">
                <template v-for="endPoint of opening.ends">
                    <rect class="endpoint" :stroke="opening.wire.color"
                        :x="ctrl.display.stdPoint(endPoint[0], 0) - openingSize / 2"
                        :y="ctrl.display.stdPoint(endPoint[1], 1) - openingSize / 2" />
                </template>
            </template>

            <template v-for="(path, i) of ctrl.paths">
                <g class="wire" :stroke="ctrl.board.openings[path.iOpening]?.wire.color ?? 'gray'" :class="activePathIndex === i && 'active'">
                    <path :d="pathsSvg[i]"/>
                </g>
            </template>

            <g v-if="cursorVisible && cursorVecSmooth.length === 2" class="cursor">
                <rect
                    :width="cursorSize[0]" :height="cursorSize[1]"
                    :x="ctrl.display.stdPoint(cursorVecSmooth[0], 0) - cursorSize[0] / 2"
                    :y="ctrl.display.stdPoint(cursorVecSmooth[1], 1) - cursorSize[1] / 2"
                />
            </g>

            <svg:style>
                .bg {
                    stroke: gold;
                    stroke-width: 0.075;
                    fill: darkgreen;
                }
                .wire {
                    fill: none;
                    stroke-width: 0.0325;
                    stroke-linecap: round;
                }
                .wire.active {
                    animation: circuitBlink 1s infinite;
                }
                .endpoint {
                    width: {{openingSize}}px; height: {{openingSize}}px;

                    fill: black;
                    stroke-width: 0.025;
                }
            </svg:style>
        </svg>

        <div class="toolbar">
            <ul class="indicators">
                <template v-for="(opening, i) in ctrl.board.openings">
                    <li class="opening" :aria-current="ctrl.boardState.openingsClosed[i] ? 'step' : undefined" :style="`--color: ${opening.wire.color}`"></li>
                </template>
            </ul>
            <div role="separator"/>
            <div class="indicator" data-name="cursorPosition">{{ cursorLocationStr }}</div>
        </div>
    </div>
</template>

<style lang="scss">
.mg.-short-circuit {
    .board {
        position: relative;

        aspect-ratio: calc(var(--w) / var(--h));
        max-width: 600px;
        margin: 0 auto;

        g.cursor {
            fill: none;
            stroke: lightgray;
            stroke-width: 0.025;

            pointer-events: none;
            
            transition: x 0.1s ease, y 0.1 ease, stroke 0.1s ease;
        }

        &:not(:hover) {
            .cursor {
                stroke: transparent;
            }
        }
    }

    .toolbar {
        display: flex;
        gap: 0.5rem;
        align-items: center;

        [role="separator"] {
            width: 0.2em;
            height: 0.75em;
            border-radius: 7rem;
            background: lightgray;
        }
    }

    .indicators {
        display: flex;
        padding: 0; margin: 0;
        list-style: none;

        .opening {
            width: 1em;
            height: 1em;
            background: var(--color);

            &:not([aria-current]) {
                filter: saturate(0.5) opacity(0.5);
            }
        }
    }
    [data-name="cursorPosition"] {
        font-family: 'Courier New', Courier, monospace;
    }
}

@keyframes circuitBlink {
    0%, 100% {
        filter: brightness(1) blur(0px);
    }
    50% {
        filter: brightness(1.5) blur(0.01px);
    }
}
</style>
