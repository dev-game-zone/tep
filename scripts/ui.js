// ui.js
import { totalScore, currentLevel } from './state.js';

export let showPrompt = true;
setTimeout(() => showPrompt = false, 10000);

export function drawUI(ctx, score, level, difficulty) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Score: ' + score, 20, 30);
    ctx.fillText('Level: ' + (level + 1), 20, 60);
    ctx.fillText('Difficulty: ' + difficulty, 20, 90);
}

export function drawPrompt(ctx) {
    if (!showPrompt) return;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(400, 20, 380, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText('Tip: Rotate cluster with mouse wheel or ↑/↓ keys.', 410, 45);
}
