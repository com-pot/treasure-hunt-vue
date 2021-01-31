const pi2 = Math.PI * 2;

export function angleToVelocity(angle: number): number {
    if (angle < -Math.PI) {
        angle += pi2;
    } else if (angle > Math.PI) {
        angle -= pi2;
    }

    return Math.sign(angle) * Math.min(0.10, Math.abs(angle) * 0.15);
}

export function interpolateVelocity(current: number, target: number, momentum: number) {
    let targetStronger = Math.abs(current) < Math.abs(target);
    let directionRelation = Math.sign(current) * Math.sign(target);

    if (targetStronger && directionRelation === 1) {
        return target;
    }

    return momentum * current + (1 - momentum) * target;
}

export default {
    angleToVelocity,
    interpolateVelocity,
}
