import { Ref, computed, reactive, ref } from "vue"
import Resources from "@src/utils/Resources"
import { Point2D, pointsSum } from "@src/utils/vectors"
import { MouseEventNormalized } from "@src/modules/treasure-hunt/components/dragging"
import { Appendages, MinigameConfig, MinigameState, UnitJoin, composePlacementList, findJointLocation } from "./appendages"

export const useUnitPlacementController = (config: Ref<MinigameConfig>, state: Ref<MinigameState>) => {
    const knownUnits = reactive<Record<string, Appendages.UnitScaleRef>>({})

    const placedList = computed(() => composePlacementList(config.value.anchor, state.value.jointMap, knownUnits))

    const allJoints = computed(() => {
        return placedList.value
            .map((placement): UnitJointLocation[] => {
                const ref = knownUnits[placement.unit]
                return Object.entries(ref.unit.joints).map(([jointName, joint]) => ({
                    ref,
                    joint,

                    jointName,
                    jointPos: findJointLocation(placement.p, ref, joint),
                    attachedBy: placement.attachedBy,
                 }))
            })
        .flat()
    })
    const emptyJoints = computed(() => allJoints.value.filter(({ref, jointName, attachedBy}) => {
        const unitJoints = state.value.jointMap[ref.unit.name]
        return !unitJoints[jointName]
    }))
    
    function initUnits(resources: Resources) {
        const unitScaleRefs = config.value.units
            .map((unit): Appendages.UnitScaleRef => {
                const res = resources.get(unit.name)
                const dimNorm = [
                    res.width / config.value.baseSize[0],
                    res.height / config.value.baseSize[1],
                ] as const
    
                return {unit, dimNorm}
            })
        unitScaleRefs.forEach((ref) => knownUnits[ref.unit.name] = ref)
    }

    function isPlaced(unitName: string): boolean {
        return !!placedList.value.find((placement) => placement.unit === unitName)
    }
    function attachTo(targetUnit: string, targetJoint: string, join: UnitJoin) {
        state.value.jointMap[targetUnit][targetJoint] = join
    }

    return {
        knownUnits,
        placedList,

        allJoints,
        emptyJoints,

        initUnits,

        isPlaced,
        attachTo,
    }
}

type UnitJointLocation = {
    ref: Appendages.UnitScaleRef,
    joint: Appendages.JointPoint
    jointName: string,
    jointPos: Point2D,
    attachedBy?: string,
}

export const usePickUnitPlaceToJointControlScheme = (controller: ReturnType<typeof useUnitPlacementController>) => {
    const selectedUnit = ref<string | null>(null)

    function findClosestJointTo(point: Point2D, candidates: UnitJointLocation[]) {
        let closest: UnitJointLocation = null
        let closestDistance = 1
        for (const candidate of candidates) {
            const d = pointsSum(point, -1, candidate.jointPos)
            const distance = Math.sqrt(d[0] * d[0] + d[1] * d[1])
            if (distance > closestDistance || distance > 0.06) continue

            closest = candidate
            closestDistance = distance
        }

        return closest
    }

    return {
        selectedUnit,

        maybeSelectUnit(unitName: string) {
            if (controller.isPlaced(unitName)) return
            selectedUnit.value = unitName
        },
        maybePlaceUnit(e: MouseEventNormalized) {
            if (!selectedUnit.value) return
            const selectedUnitObj = controller.knownUnits[selectedUnit.value]
            const selectedUnitJoint = selectedUnitObj.unit.joints[selectedUnitObj.unit.defaultJoint]

            const candidates = controller.emptyJoints.value
                .filter((candidate) => candidate.joint.type !== selectedUnitJoint.type)
                
            const closest = findClosestJointTo([e.x, e.y], candidates)
            if (!closest) return

            controller.attachTo(closest.ref.unit.name, closest.jointName, {unit: selectedUnit.value, attachedBy: selectedUnitObj.unit.defaultJoint})

            selectedUnit.value = null
        },
    }
}
