import {Radians} from "@/utils/trigonometry";

const pi2 = Math.PI * 2;

export function angleToVelocity(angle: number): number {
    if (angle < -Math.PI) {
        angle += pi2;
    } else if (angle > Math.PI) {
        angle -= pi2;
    }

    return angle
}

export function smoothenVelocity(velocity: Radians, targetVelocity: Radians, speedLimit: Radians): Radians {
    const momentum = 0.975

    const resultVelocity = momentum * velocity + (1-momentum) * targetVelocity
    if (Math.abs(resultVelocity) > speedLimit) {
        return Math.sign(resultVelocity) * speedLimit
    }

    return resultVelocity
}

export default {
    angleToVelocity,
    smoothenVelocity,
}
