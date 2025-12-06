import { generateLevels } from './levelGenerator.js';

// --- Game state ---
export let targetPentagons = [];
export let clusterPool = [];
export let rackClusters = [];
export let usedClusters = [];

// Local drag target (managed by board.js)
export let dragTarget = null;

// Constants
export const PENT_SIZE = 50;
export const SNAP_TOLERANCE = 20;

// --- Initialize clusters ---
export function initClusters() {
    clusterPool = [
        { cells: [0], rotation: 0 },
        { cells: [1], rotation: 0 },
        { cells: [2], rotation: 0 },
        { cells: [3, 4], rotation: 0 },
        { cells: [5, 6], rotation: 0 },
        { cells: [7, 8, 9], rotation: 0 },
        { cells: [0, 1, 2], rotation: 0 }
    ];
    rackClusters = [];
    usedClusters = [];
    spawnNewBatch();
}

// --- Spawn clusters into the rack ---
export function spawnNewBatch() {
    if (rackClusters.length > 0) return; // only spawn if empty
    for (let i = 0; i < 3 && clusterPool.length > 0; i++) {
        const idx = Math.floor(Math.random() * clusterPool.length);
        const cl = clusterPool.splice(idx, 1)[0];
        cl.x = 540;
        cl.y = 60 + i * 150;
        cl.origX = cl.x;
        cl.origY = cl.y;
        cl.dragging = false;
        rackClusters.push(cl);
    }
}

// --- Load level dynamically ---
export function loadLevel(levelIndex) {
    targetPentagons = generateLevels(levelIndex).map(p => ({ x: p.x, y: p.y, placed: false }));
    initClusters();
}

// --- Attempt to place a cluster ---
export function tryPlaceCluster(cluster) {
    if (!cluster) return;

    const firstIdx = cluster.cells[0];
    let clusterFits = true;
    const closestTargets = [];

    for (const idx of cluster.cells) {
        const cell = targetPentagons[idx];
        const dx0 = cell.x - targetPentagons[firstIdx].x;
        const dy0 = cell.y - targetPentagons[firstIdx].y;
        const angle = cluster.rotation || 0;
        const dx = dx0 * Math.cos(angle) - dy0 * Math.sin(angle);
        const dy = dx0 * Math.sin(angle) + dy0 * Math.cos(angle);
        const px = cluster.x + dx;
        const py = cluster.y + dy;

        let nearest = null;
        let minDist = Infinity;
        for (const t of targetPentagons) {
            if (t.placed) continue;
            const d = Math.hypot(px - t.x, py - t.y);
            if (d < minDist) { minDist = d; nearest = t; }
        }
        if (minDist > SNAP_TOLERANCE) clusterFits = false;
        closestTargets.push(nearest);
    }

    if (clusterFits) {
        // Commit placement
        let clusterPoints = 0;
        for (let i = 0; i < cluster.cells.length; i++) {
            const t = closestTargets[i];
            if (!t) continue;
            t.placed = true;
            // simple scoring: 10 points per pentagon
            clusterPoints += 10;
        }
        // Update score externally (board/main should add clusterPoints)
        const ridx = rackClusters.indexOf(cluster);
        if (ridx !== -1) rackClusters.splice(ridx, 1);
        usedClusters.push(cluster);

        if (rackClusters.length === 0 && clusterPool.length > 0) {
            spawnNewBatch();
        }
    } else {
        // Snap back
        cluster.x = cluster.origX;
        cluster.y = cluster.origY;
        cluster.rotation = 0;
    }

    checkSolvable();
}

// --- Hybrid solvability check ---
export function checkSolvable() {
    const empty = targetPentagons.filter(p => !p.placed);
    if (empty.length === 0) return;

    const allClusters = [...rackClusters, ...clusterPool];
    const totalCellsLeft = allClusters.reduce((sum, cl) => sum + cl.cells.length, 0);
    if (totalCellsLeft < empty.length) {
        setTimeout(() => alert("Game Over! Cannot complete the shape."), 10);
        return;
    }

    function canFill(empties, clusters) {
        if (empties.length === 0) return true;
        if (clusters.length === 0) return false;

        clusters.sort((a, b) => b.cells.length - a.cells.length);

        for (let i = 0; i < clusters.length; i++) {
            const cl = clusters[i];
            const rest = clusters.slice(0, i).concat(clusters.slice(i + 1));

            for (const start of empties) {
                for (let r = 0; r < 16; r++) {
                    const angle = (2 * Math.PI / 16) * r;
                    let fits = true;
                    const matched = [];

                    for (let j = 0; j < cl.cells.length; j++) {
                        const base = targetPentagons[cl.cells[0]];
                        const cell = targetPentagons[cl.cells[j]];
                        const dx0 = cell.x - base.x;
                        const dy0 = cell.y - base.y;
                        const dx = dx0 * Math.cos(angle) - dy0 * Math.sin(angle);
                        const dy = dx0 * Math.sin(angle) + dy0 * Math.cos(angle);
                        const px = start.x + dx;
                        const py = start.y + dy;
                        const match = empties.find(e => Math.hypot(px - e.x, py - e.y) <= SNAP_TOLERANCE);
                        if (!match || matched.includes(match)) { fits = false; break; }
                        matched.push(match);
                    }

                    if (fits) {
                        const newEmpties = empties.filter(e => !matched.includes(e));
                        if (canFill(newEmpties, rest)) return true;
                    }
                }
            }
        }
        return false;
    }

    if (!canFill(empty.slice(), allClusters.slice())) {
        setTimeout(() => alert("Game Over! Cannot complete the shape."), 10);
    }
}
