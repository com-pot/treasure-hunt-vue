export type Radians = number;
export type Degrees = number;

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

export default {
    angularPosition,
    circuitPosition,
}
