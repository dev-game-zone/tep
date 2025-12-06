import { targetPentagons } from './state.js';

export function generateClusters(targets) {
    const pool = [];
    // Example cluster sizes: 1–3 for prototype
    pool.push({ cells: [0], rotation: 0 });
    pool.push({ cells: [1], rotation: 0 });
    pool.push({ cells: [2, 3], rotation: 0 });
    pool.push({ cells: [4, 5, 6], rotation: 0 });
    pool.push({ cells: [0, 1, 2], rotation: 0 });
    return pool;
}
