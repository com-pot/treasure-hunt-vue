import {Radians} from "@src/utils/trigonometry";

const pi2 = Math.PI * 2;

export function angleToVelocity(angle: number): number {
    if (angle < -Math.PI) {
        angle += pi2;
    } else if (angle > Math.PI) {
        angle -= pi2;
    }

    return angle
}

export function smoothenVelocity(velocity: Radians, combinedForce: Radians, speedLimit: Radians, momentum: number): Radians {
    const resultVelocity = momentum * velocity + (1-momentum) * combinedForce


    return resultVelocity
}

export default {
    angleToVelocity,
    smoothenVelocity,
}
