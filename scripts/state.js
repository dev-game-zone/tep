import { generateLevel } from './levelGenerator.js';
import { generateClusters } from './tileGenerator.js';

export let targetPentagons = [];
export let clusterPool = [];
export let rackClusters = [];
export let usedClusters = [];
export let dragTarget = null;

export function loadLevel(level) {
    targetPentagons = generateLevel(level);
    clusterPool = [];
    rackClusters = [];
    usedClusters = [];
}

export function initClusters() {
    clusterPool = generateClusters(targetPentagons);
    spawnNewBatch();
}

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

export function checkGameSolvable() {
    if (!checkSolvable(targetPentagons, rackClusters, clusterPool)) {
        setTimeout(() => alert("Game Over! Cannot complete the shape."), 10);
    }
}
