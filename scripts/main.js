import { loadLevel, spawnNewBatch } from './state.js';
import { drawBoard, drawClusters, drawUI, drawPrompt } from './board.js';
import { getDifficulty } from './difficulty.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let currentLevel = 0;
let totalScore = 0;

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard(ctx);
    drawClusters(ctx);
    drawUI(ctx, totalScore, currentLevel, getDifficulty());
    drawPrompt(ctx);
    requestAnimationFrame(gameLoop);
}

// Initialize first level
loadLevel(currentLevel);  // loads targetPentagons and clusterPool
spawnNewBatch();           // spawns first batch of clusters in rack

// Start game loop
gameLoop();
