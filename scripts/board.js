import { targetPentagons, rackClusters, dragTarget, checkGameSolvable } from './state.js';
import { PENT_SIZE, SNAP_TOLERANCE, rotatePoint } from './geometry.js';

export function drawBoard(ctx) {
    targetPentagons.forEach(p => {
        drawPentagon(ctx, p.x, p.y, PENT_SIZE, p.placed ? "#44aa44" : "#333333");
    });
}

export function drawClusters(ctx) {
    rackClusters.forEach(cl => {
        cl.cells.forEach((idx, i) => {
            const dx = targetPentagons[idx].x - targetPentagons[cl.cells[0]].x;
            const dy = targetPentagons[idx].y - targetPentagons[cl.cells[0]].y;
            const [rx, ry] = rotatePoint(dx, dy, cl.rotation || 0);
            drawPentagon(ctx, cl.x + rx, cl.y + ry, PENT_SIZE, "#ffaa44");
        });
    });
}

export function drawPentagon(ctx, x, y, size, color = "#4da6ff") {
    const angle = 2 * Math.PI / 5;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const px = x + size * Math.cos(angle * i - Math.PI / 2);
        const py = y + size * Math.sin(angle * i - Math.PI / 2);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

export function drawUI(ctx, score, level, difficulty) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px sans-serif";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("Level: " + (level + 1), 20, 60);
    ctx.fillText("Difficulty: " + difficulty, 20, 90);
}

export let showPrompt = true;
setTimeout(() => showPrompt = false, 10000);

export function drawPrompt(ctx) {
    if (!showPrompt) return;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(400, 20, 380, 50);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px sans-serif";
    ctx.fillText("Tip: Rotate selected cluster with mouse wheel or ↑/↓ keys.", 410, 45);
}
