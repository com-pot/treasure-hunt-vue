<script lang="ts" setup>
import { PropType, onMounted, h, computed, ref, Ref } from 'vue'
import { useAsyncState } from '@vueuse/core'
import LoadingIndicator from '@src/modules/Layout/components/LoadingIndicator.vue'
import useAsyncIndicator from '@src/modules/Layout/mixins/useAsyncIndicator';
import Resources, {prepareImageResourceIndex} from "@src/utils/Resources"
import { pointMulIsolated, pointsSum, joinPointToCss } from '@src/utils/vectors';
import { exposeMinigameControls, useViewState } from '@src/modules/treasure-hunt/components/minigameData';
import { MinigameConfig, MinigameState, Appendages, serializeAppendagesState } from './appendages'
import { useUnitPlacementController, usePickUnitPlaceToJointControlScheme } from "./appendages.vueController"
import { useDragging } from '@src/modules/treasure-hunt/components/dragging';

const emit = defineEmits()
const props = defineProps({
    challengeConfig: {type: Object as PropType<MinigameConfig>, required: true},
})

const challengeConfig = computed(() => props.challengeConfig)

const resources = useAsyncState(async () => {
    const resources = new Resources(prepareImageResourceIndex(challengeConfig.value.units.map((unit) => {
        return [unit.name, unit.img] as const
    })))
    await resources.whenReady()
    return resources
}, null)


const minigameData = useViewState<MinigameState>(() => {
    const jointMap = Object.fromEntries(
        challengeConfig.value.units.map((unit) => [unit.name, {}]),
    )
    return {
        jointMap: jointMap,
    }
})

const placementController = useUnitPlacementController(challengeConfig, minigameData as unknown as Ref<MinigameState>)
const placedUnits = placementController.placedList

const controlScheme = usePickUnitPlaceToJointControlScheme(placementController)

function renderUnit(ref: Appendages.UnitScaleRef, placement?: Appendages.UnitPlacement) {
    const p = placement?.p
    const r = placement?.r
    const usedJoints = placement?.unit && minigameData.value.jointMap[placement.unit]

    let attachPoint = placement?.attachedBy ? ref.unit.joints[placement.attachedBy]?.point : ref.unit.centerOfGravity
    if (placement && !attachPoint) {
        console.error("unknown attachPoint", placement.attachedBy, ref.unit)
        return
    }

    let style = `--w: ${ref.dimNorm[0]}; --h: ${ref.dimNorm[1]};`
        + joinPointToCss(attachPoint, '--attach-x', '--attach-y')
    if (typeof r === 'number') style += `--r: ${r};`
    if (p) style += joinPointToCss(pointsSum(p, -1, pointMulIsolated(ref.dimNorm, attachPoint)))

    const unitGraphicalElements = [
        h('img', {src: ref.unit.img, alt: ""}),
    ]
    if (false && usedJoints) {
        const jointsToBeRendered = Object.entries(ref.unit.joints)
            // .filter(([jointName]) => !minigameData.value.jointMap[ref.unit.name][jointName])
            
        unitGraphicalElements.push(...jointsToBeRendered.map(([jointName, joint]) => {
            const isUsed = !!minigameData.value.jointMap[ref.unit.name]?.[jointName]
            console.log(ref.unit.name, jointName, isUsed)
            
            return h('div', {
                key: jointName,
                class: [
                    isUsed && '-used',
                    'joint',
                ],
                style: `--x: ${joint.point[0]}; --y: ${joint.point[1]}; --d: ${joint.direction};`,
                'data-name': jointName,
                'data-type': joint.type,
            })
        }))
    }

    return h('div', {
        class: 'unit', style,
    }, unitGraphicalElements)
}

exposeMinigameControls({
    getValue: () => serializeAppendagesState(minigameData.value),
    reset: () => minigameData.reset(),
}, emit)

const viewState = useAsyncIndicator('loading')

const tableEl = ref()

useDragging(tableEl, {
    start(e) {
        controlScheme.maybePlaceUnit(e)
    },
})

onMounted(() => {
    viewState.awaitTask(
        resources.execute()
            .then(() => placementController.initUnits(resources.state.value))
    )
})

</script>

<template>
    <LoadingIndicator v-if="viewState.status !== 'ready'"/>

    <div class="mg -appendages" v-else>
        <div class="table" :style="`--w: ${challengeConfig.baseSize[0]}; --h: ${challengeConfig.baseSize[1]}`"
            ref="tableEl"
        >
            <template v-for="placement of placedUnits">
                <component :is="renderUnit(placementController.knownUnits[placement.unit], placement)"/>
            </template>
        </div>

        <div class="drawer">
            <template v-for="unitRef of placementController.knownUnits" :key="unitRef.unit.name">
                <div class="tile" :class="placementController.isPlaced(unitRef.unit.name) && '-placed'"
                    :aria-selected="controlScheme.selectedUnit.value === unitRef.unit.name || undefined"
                    @click="controlScheme.maybeSelectUnit(unitRef.unit.name)"
                >
                    <component :is="renderUnit(unitRef)"/>
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="scss">
.mg.-appendages {
    --drawer-tile-size: min(10vw, 6rem);
    display: grid;
    > * {
        grid-area: 1 / 1;
    }

    .unit {
        position: absolute;
        --joint-size: 1rem;

        transform-origin: calc(var(--attach-x) * 100%) calc(var(--attach-y) * 100%);

        img {
            width: 100%;
        }

        .joint {
            z-index: 4;
            position: absolute;
            left: calc(var(--x) * 100%);
            top: calc(var(--y) * 100%);

            width: var(--joint-size);
            aspect-ratio: 1;
            border-radius: calc(var(--joint-size) * 0.3);
            border: 2px solid red;
            
            transform: translate(
                calc(-0.5 * (var(--joint-size) + 1px)),
                calc(-0.5 * (var(--joint-size) + 1px))
            );

            transition: all 0.2s ease;

            &.-used {
                opacity: 0.2;
            }

            &[data-type="ball"] {
                --joint-size: 4px;
            }
        }
    }

    .table {
        position: relative;
        aspect-ratio: calc(var(--w) / var(--h));
        width: 100%;

        background: lightgray;

        .unit {
            width: calc(100% * var(--w));
            height: calc(100% * var(--h));
            left: calc(var(--x) * 100%);
            top: calc(var(--y) * 100%);

            rotate: calc(var(--r, 0) * 1turn);
        }
    }

    .drawer {
        z-index: 1;
        place-self: end stretch;
        
        background-color: rgb(gray,  0.25);
        
        display: flex;
        flex-direction: row;
        gap: 0.25rem;
        padding: 0.25rem;

        overflow-x: scroll;

        .tile {
            width: var(--drawer-tile-size);
            height: var(--drawer-tile-size);

            --hsl: 0 20% 20%;
            background-color: hsl(var(--hsl) / 20%);
            border: 2px solid hsl(var(--hsl) / 69%);

            display: grid;
            place-content: center;

            &[aria-selected] {
                --hsl: var(--hsl-primary-components);
            }

            &.-placed {
                --hsl: 0 10% 90%;
            }
        }

        .unit {
            --joint-size: 0.1rem;
            position: relative;

            max-width: calc(var(--drawer-tile-size) - 0.25rem);
            max-height: calc(var(--drawer-tile-size) - 0.25rem);
            aspect-ratio: calc(var(--w) / var(--h));

            img {
                width: 100%;
                height: 100%;
            }
        }
    }

    
}

</style>