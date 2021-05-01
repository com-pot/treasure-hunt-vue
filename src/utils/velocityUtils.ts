const pi2 = Math.PI * 2;

export function angleToVelocity(angle: number, speedLimit: number): number {
    if (angle < -Math.PI) {
        angle += pi2;
    } else if (angle > Math.PI) {
        angle -= pi2;
    }

    if (Math.abs(angle) > speedLimit) {
        angle = Math.sign(angle) * speedLimit
    }

    return angle
}

export default {
    angleToVelocity,
}
