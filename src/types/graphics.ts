export type Radians = number;
export type Degrees = number;

export type Point2D = { x: number, y: number };

export type PointRad2D = {
    angle: Radians,
    radius: number,
}

export const degToRad = (deg: Degrees) => deg / 180 * Math.PI as Radians;
export const radToDeg = (rad: Radians) => rad * 180 / Math.PI as Degrees;
