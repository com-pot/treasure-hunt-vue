import { Radians } from "@src/utils/trigonometry"
import {Point2D, Vector2D, pointMulIsolated, pointsSum} from "@src/utils/vectors"

export namespace Appendages {

    export type JointPoint = {
        type: 'ball' | 'socket',
        point: Point2D,
        direction: Radians,
    }

    export type Unit = {
        name: string,
        img: string,
        centerOfGravity: Point2D,

        joints: Record<string, JointPoint>,
        defaultJoint: string | undefined,
    }

    export type UnitScaleRef = {
        unit: Unit,
        dimNorm: Vector2D,
    }

    export type UnitPlacement<Joint extends string = string> = {
        unit: string,
        attachedBy?: Joint,
        attachedTo?: string,

        p: Point2D,
        r?: number,
    }
}


export type MinigameConfig = {
    baseSize: Vector2D,
    anchor: {p: Point2D, unit: string, r?: number},

    units: Appendages.Unit[],
}

type UnitName = string
type JointName = string
export type UnitJoin = {unit: UnitName, attachedBy: string}
export type MinigameState = {
    jointMap: {
        [name: UnitName]: Record<JointName, UnitJoin>,
    },
}

export function composePlacementList(anchor: MinigameConfig['anchor'], jointMap: MinigameState['jointMap'], knownUnits: Record<string, Appendages.UnitScaleRef>) {
    const toWalk: Appendages.UnitPlacement[] = [
        {...anchor},
    ]

    const placements: Appendages.UnitPlacement[] = []
    let placement: typeof toWalk[number];
    while ((placement = toWalk.shift())) {
        placements.push(placement)
        const unitJoints = jointMap[placement.unit]
        Object.entries(unitJoints || {}).forEach(([jointName, join]) => {
            if (!join) return
            const ref = knownUnits[placement.unit]
            if (!ref) {
                console.error("Invalid placement - unknown unit", placement);
                return
            }
            const joint = ref.unit.joints[jointName]
            if (!joint) {
                console.error((`Invalid placement - unknown joint ${placement.unit}[${jointName}]`));
                return
            }
            const joinedUnit = knownUnits[join.unit]
            const joinedUnitJoint = joinedUnit.unit.joints[joinedUnit.unit.defaultJoint]
            
            const joinedUnitPos = findJointLocation(placement.p, ref, joint)
            const r = joint.direction - (joinedUnitJoint?.direction ?? 0)
            // console.log(`${placement.unit}[${jointName}] = ${join}`, joinedUnitPos, r)
            toWalk.push({
                unit: join.unit,
                attachedBy: join.attachedBy,
                attachedTo: ref.unit.name,
                p: joinedUnitPos, r,
            })
        })
    }

    return placements
}

export function serializeAppendagesState(state: MinigameState) {

    const construction = Object.entries(state.jointMap)
        .map(([unitName, joints]) => {
            return Object.entries(joints)
                .map(([jointName, joint]) => `${unitName}[${jointName}]->[${joint.attachedBy}]${joint.unit}`)
        })
        .flat()
        .sort()

    return construction
}

export const findJointLocation = (p: Point2D, ref: Appendages.UnitScaleRef, joint: Appendages.JointPoint): Point2D => {
    const jointOffset = pointMulIsolated(pointsSum(joint.point, -1, ref.unit.centerOfGravity), ref.dimNorm)
    return pointsSum(p, jointOffset)
}