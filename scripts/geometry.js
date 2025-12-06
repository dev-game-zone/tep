// geometry.js
export const PENT_SIZE = 50;
export const SNAP_TOLERANCE = 20;

export function rotatePoint(dx, dy, angle) {
    const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
    const ry = dx * Math.sin(angle) + dy * Math.cos(angle);
    return [rx, ry];
}
