export const PENT_SIZE = 50;
export const SNAP_TOLERANCE = 20;

export function rotatePoint(x, y, angle) {
    const rx = x * Math.cos(angle) - y * Math.sin(angle);
    const ry = x * Math.sin(angle) + y * Math.cos(angle);
    return [rx, ry];
}
