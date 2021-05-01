export type Radians = number;
export type Degrees = number;

const pi2 = Math.PI * 2
const piHalf = Math.PI * 0.5

export type Point2D = { x: number, y: number };

export type PointRad2D = {
    angle: Radians,
    radius: number,
}

export const degToRad = (deg: Degrees) => deg / 180 * Math.PI as Radians;
export const radToDeg = (rad: Radians) => rad * 180 / Math.PI as Degrees;

export function angularPosition(x: number, y: number, centerX: number, centerY: number): PointRad2D {
    let dX = x - centerX;
    let dY = y - centerY;
    let radius = Math.sqrt(dX * dX + dY * dY);
    let angle = Math.atan(dY / dX);

    if (dX < 0) {
        angle += Math.PI;
    } else if (dY < 0) {
        angle += Math.PI * 2;
    }

    return {radius, angle};
}

export function circuitPosition(angle: Radians, radius: number, centerX: number, centerY: number): Point2D {
    return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
    };
}

export function clearOverRotation(a: Radians): Radians {
    if (a > 0) {
        while (a > pi2) {
            a -= pi2
        }
    } else if (a < 0) {
        while (a < -pi2) {
            a+= pi2
        }
    }
    return a
}
export function minAngleDiff(a: Radians, b: Radians) {
    let d = clearOverRotation(a) - clearOverRotation(b)
    if (d > 0) {
        while (d >= Math.PI) {
            d -= pi2
        }
    } else if (d < 0) {
        while (d < -Math.PI) {
            d += pi2
        }
    }
    return d
}

export default {
    angularPosition,
    circuitPosition,

    minAngleDiff,
}
