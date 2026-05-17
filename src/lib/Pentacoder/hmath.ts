export class Point {
    x: number = 0;
    y: number = 0;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

// Angle and radius to position
export function ar2point(angle: number, radius: number): Point {
    return new Point(radius*Math.sin(angle), radius*Math.cos(angle));
}

export function circumference(radius: number): number {
    return (2*Math.PI) * radius; // C = 2πr
}

export function radius(circum: number): number {
    return circum / (2*Math.PI); // r = C/2π
}

export function degrees(r: number) {
    return r * (180/Math.PI);
}
export function radians(d: number) {
    return d * (Math.PI/180);
}