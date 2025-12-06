// state.js
import { PENT_SIZE, SNAP_TOLERANCE } from './geometry.js';

export let currentLevel = 0;
export let totalScore = 0;

export let targetPentagons = [];
export let clusterPool = [];
export let rackClusters = [];
export let usedClusters = [];

export function loadLevel(level, levels) {
    targetPentagons = levels[level].map(p => ({ x: p.x, y: p.y, placed: false }));
    initClusters();
}

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

export function spawnNewBatch() {
    if (rackClusters.length > 0) return;
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

export function tryPlaceCluster(cl) {
    if (!cl) return;

    const firstIdx = cl.cells[0];
    let clusterFits = true;
    let closestTargets = [];

    cl.cells.forEach(idx => {
        const cell = targetPentagons[idx];
        const dx0 = cell.x - targetPentagons[firstIdx].x;
        const dy0 = cell.y - targetPentagons[firstIdx].y;
        const angle = cl.rotation || 0;
        const dx = dx0 * Math.cos(angle) - dy0 * Math.sin(angle);
        const dy = dx0 * Math.sin(angle) + dy0 * Math.cos(angle);
        const px = cl.x + dx;
        const py = cl.y + dy;

        let nearest = null;
        let minDist = Infinity;
        for (const t of targetPentagons) {
            if (t.placed) continue;
            const d = Math.hypot(px - t.x, py - t.y);
            if (d < minDist) { minDist = d; nearest = t; }
        }
        if (minDist > SNAP_TOLERANCE) clusterFits = false;
        closestTargets.push(nearest);
    });

    if (clusterFits) {
        let clusterPoints = 0;
        cl.cells.forEach((idx, i) => {
            const t = closestTargets[i];
            const cell = targetPentagons[idx];
            const dx0 = cell.x - targetPentagons[firstIdx].x;
            const dy0 = cell.y - targetPentagons[firstIdx].y;
            const angle = cl.rotation || 0;
            const dx = dx0 * Math.cos(angle) - dy0 * Math.sin(angle);
            const dy = dx0 * Math.sin(angle) + dy0 * Math.cos(angle);
            const px = cl.x + dx;
            const py = cl.y + dy;
            const dist = Math.hypot(px - t.x, py - t.y);
            if (dist <= 5) clusterPoints += 10;
            else if (dist <= 10) clusterPoints += 7;
            else clusterPoints += 5;
            t.placed = true;
        });
        totalScore += clusterPoints;

        const idxInRack = rackClusters.indexOf(cl);
        if (idxInRack !== -1) rackClusters.splice(idxInRack, 1);
        usedClusters.push(cl);

        if (rackClusters.length === 0 && clusterPool.length > 0) spawnNewBatch();
    } else {
        cl.x = cl.origX;
        cl.y = cl.origY;
        cl.rotation = 0;
    }
}

export function checkSolvable() {
    const empty = targetPentagons.filter(p => !p.placed);
    if (empty.length === 0) return;

    const allClusters = [...rackClusters, ...clusterPool];
    const totalCellsLeft = allClusters.reduce((s, c) => s + c.cells.length, 0);
    if (totalCellsLeft < empty.length) {
        setTimeout(() => alert("Game Over! Cannot complete the shape."), 10);
        return;
    }

    // Minimal hybrid solver (rotation-aware)
    function canFill(empties, clusters) {
        if (empties.length === 0) return true;
        if (clusters.length === 0) return false;
        clusters.sort((a, b) => b.cells.length - a.cells.length);

        for (let i = 0; i < clusters.length; i++) {
            const cl = clusters[i];
            const rest = clusters.slice(0, i).concat(clusters.slice(i + 1));
            for (const start of empties) {
                const angle = 0; // simplified
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
                    const newEmpty = empties.filter(e => !matched.includes(e));
                    if (canFill(newEmpty, rest)) return true;
                }
            }
        }
        return false;
    }

    if (!canFill(empty.slice(), allClusters.slice())) {
        setTimeout(() => alert("Game Over! Cannot complete the shape."), 10);
    }
}
