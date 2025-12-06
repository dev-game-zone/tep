// main.js
import { loadLevel, currentLevel } from './state.js';
import { drawBoard, drawClusters } from './board.js';
import { drawUI, drawPrompt } from './ui.js';
import { getDifficulty } from './difficulty.js';
import { generateLevels } from './levelGenerator.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const levels = generateLevels();

loadLevel(currentLevel, levels);

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard(ctx);
    drawClusters(ctx);
    drawUI(ctx, 0, currentLevel, getDifficulty());
    drawPrompt(ctx);
    requestAnimationFrame(loop);
}

loop();
