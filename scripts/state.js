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

// Game tracking
export let totalScore = 0;
export let currentLevel = 0;

// --- Initialize clusters ---
export function initClusters() {
    const maxIdx = targetPentagons.length - 1;

    // Only include indices within the current level grid
    clusterPool = [
        { cells: [0], rotation: 0 },
        { cells: [1], rotation: 0 },
        { cells: [0, 1], rotation: 0 },
        { cells: [0, 1, 2], rotation: 0 }
    ].map(c => ({
        cells: c.cells.filter(idx => idx <= maxIdx),
        rotation: 0
    })).filter(c => c.cells.length > 0);

    rackClusters = [];
    usedClusters = [];
    spawnNewBatch();
}

// --- Spawn up to 3 clusters into the rack ---
export function spawnNewBatch() {
    if (rackClusters.length > 0) return;
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
    totalScore = 0;
}

// --- Try placing a cluster on the board ---
export function tryPlaceCluster(cluster) {
    if (!cluster || !cluster.cells || cluster.cells.length === 0) return;

    const firstIdx = cluster.cells[0];
    let clusterFits = true;
    const closestTargets = [];

    for (const idx of cluster.cells) {
        const cell = targetPentagons[idx];
        if (!cell) {
            clusterFits = false;
            break;
        }

        const dx0 = cell.x - targetPentagons[firstIdx].x;
        const dy0 = cell.y - targetPentagons[firstIdx].y;
        const angle = cluster.rotation || 0;
        const dx = dx0 * Math.cos(angle) - dy0 * Math.sin(angle);
        const dy = dx0 * Math.sin(angle) + dy0 * Math.cos(angle);
        const px = cluster.x + dx;
        const py = cluster.y + dy;

        // find nearest empty pentagon
        let nearest = null;
        let minDist = Infinity;
        for (const t of targetPentagons) {
            if (t.placed) continue;
            const d = Math.hypot(px - t.x, py - t.y);
            if (d < minDist) { minDist = d; nearest = t; }
        }

        if (!nearest || minDist > SNAP_TOLERANCE) clusterFits = false;
        closestTargets.push(nearest);
    }

    if (clusterFits) {
        let clusterPoints = 0;
        for (let t of closestTargets) {
            if (!t) continue;
            t.placed = true;
            clusterPoints += 10;
        }
        totalScore += clusterPoints;

        const ridx = rackClusters.indexOf(cluster);
        if (ridx !== -1) rackClusters.splice(ridx, 1);
        usedClusters.push(cluster);

        if (rackClusters.length === 0 && clusterPool.length > 0) {
            spawnNewBatch();
        }
    } else {
        // snap back
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

    // Only trigger game over if there is truly no way to fill
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
                    const matched = [];
                    let fits = true;

                    for (let j = 0; j < cl.cells.length; j++) {
                        const base = targetPentagons[cl.cells[0]];
                        const cell = targetPentagons[cl.cells[j]];
                        if (!cell) { fits = false; break; }

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
        // Only alert when truly unsolvable
        setTimeout(() => alert("Game Over! Cannot complete the shape."), 10);
    }
}
