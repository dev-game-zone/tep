import { generateLevel } from './levelGenerator.js';
import { generateClusters } from './tileGenerator.js';
import { SNAP_TOLERANCE } from './geometry.js';

// Game state
export let targetPentagons = [];
export let clusterPool = [];
export let rackClusters = [];
export let usedClusters = [];
export let dragTarget = null;

export let totalScore = 0;
export let currentLevel = 0;

// Load a level
export function loadLevel(level) {
    targetPentagons = generateLevel(level);
    clusterPool = generateClusters(targetPentagons);
    rackClusters = [];
    usedClusters = [];
}

// Spawn a batch of up to 3 clusters
export function spawnNewBatch() {
    rackClusters = [];
    for (let i = 0; i < 3 && clusterPool.length > 0; i++) {
        const idx = Math.floor(Math.random() * clusterPool.length);
        const cl = clusterPool.splice(idx, 1)[0];
        cl.x = 550;
        cl.y = 50 + i * 150;
        cl.origX = cl.x;
        cl.origY = cl.y;
        cl.rotation = 0;
        cl.dragging = false;
        rackClusters.push(cl);
    }
}

// Check if current clusters + pool can fill remaining empty pentagons
export function checkSolvable() {
    const empty = targetPentagons.filter(p => !p.placed);
    if (empty.length === 0) return true;

    const totalCellsLeft = rackClusters.reduce((sum, cl) => sum + cl.cells.length, 0) +
        clusterPool.reduce((sum, cl) => sum + cl.cells.length, 0);

    return totalCellsLeft >= empty.length;
}

// Handle placement of a cluster
export function tryPlaceCluster(cl) {
    const firstIdx = cl.cells[0];
    let clusterFits = true;
    const closestTargets = [];

    cl.cells.forEach((idx) => {
        const pent = targetPentagons[idx];
        let closest = null;
        let minDist = Infinity;

        for (let t of targetPentagons) {
            if (t.placed) continue;
            const dx0 = pent.x - targetPentagons[firstIdx].x;
            const dy0 = pent.y - targetPentagons[firstIdx].y;
            const angle = cl.rotation || 0;
            const dx = dx0 * Math.cos(angle) - dy0 * Math.sin(angle);
            const dy = dx0 * Math.sin(angle) + dy0 * Math.cos(angle);
            const px = cl.x + dx;
            const py = cl.y + dy;
            const dist = Math.hypot(px - t.x, py - t.y);
            if (dist < minDist) {
                minDist = dist;
                closest = t;
            }
        }

        if (minDist > SNAP_TOLERANCE) clusterFits = false;
        closestTargets.push(closest);
    });

    if (clusterFits) {
        // Mark tiles as placed & score points
        let clusterPoints = 0;
        cl.cells.forEach((_, i) => {
            const t = closestTargets[i];
            t.placed = true;
            clusterPoints += 10; // fixed for prototype
        });

        totalScore += clusterPoints;

        // Remove from rack and push to used
        const idxInRack = rackClusters.indexOf(cl);
        if (idxInRack !== -1) rackClusters.splice(idxInRack, 1);
        usedClusters.push(cl);

        // Spawn new batch if current empty
        if (rackClusters.length === 0 && clusterPool.length > 0) {
            spawnNewBatch();
        }

        return true;
    } else {
        // Return cluster to original position
        cl.x = cl.origX;
        cl.y = cl.origY;
        cl.rotation = 0;
        return false;
    }
}
