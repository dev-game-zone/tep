import { targetPentagons, rackClusters, dragTarget, tryPlaceCluster } from './state.js';
import { PENT_SIZE, SNAP_TOLERANCE, rotatePoint } from './geometry.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Mouse Events ---
canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (let cl of rackClusters) {
        for (let idx of cl.cells) {
            const pent = targetPentagons[idx];
            const dx = cl.x - mx;
            const dy = cl.y - my;
            if (Math.hypot(dx, dy) < PENT_SIZE) {
                dragTarget = cl;
                cl.dragging = true;
                cl.offsetX = mx - cl.x;
                cl.offsetY = my - cl.y;
                return;
            }
        }
    }
});

canvas.addEventListener('mousemove', e => {
    if (!dragTarget) return;
    const rect = canvas.getBoundingClientRect();
    dragTarget.x = e.clientX - rect.left - dragTarget.offsetX;
    dragTarget.y = e.clientY - rect.top - dragTarget.offsetY;
});

canvas.addEventListener('mouseup', () => {
    if (!dragTarget) return;
    dragTarget.dragging = false;
    tryPlaceCluster(dragTarget);
    dragTarget = null;
});

// Mouse wheel rotation
canvas.addEventListener('wheel', e => {
    if (!dragTarget) return;
    e.preventDefault();
    dragTarget.rotation += e.deltaY > 0 ? 0.1 : -0.1;
});

// Keyboard rotation
document.addEventListener('keydown', e => {
    if (!dragTarget) return;
    if (e.key === 'ArrowUp') dragTarget.rotation += 0.1;
    if (e.key === 'ArrowDown') dragTarget.rotation -= 0.1;
});

// --- Drawing ---
export function drawBoard(ctx) {
    targetPentagons.forEach(p => {
        drawPentagon(ctx, p.x, p.y, PENT_SIZE, p.placed ? '#44aa44' : '#333333');
    });
}

export function drawClusters(ctx) {
    rackClusters.forEach(cl => {
        cl.cells.forEach((idx) => {
            const dx = targetPentagons[idx].x - targetPentagons[cl.cells[0]].x;
            const dy = targetPentagons[idx].y - targetPentagons[cl.cells[0]].y;
            const [rx, ry] = rotatePoint(dx, dy, cl.rotation || 0);
            const px = cl.x + rx;
            const py = cl.y + ry;
            drawPentagon(ctx, px, py, PENT_SIZE, cl.dragging ? '#ffff00' : '#ffaa44');
        });
    });
}

export function drawPentagon(ctx, x, y, size, color = '#4da6ff') {
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
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Score: ' + score, 20, 30);
    ctx.fillText('Level: ' + (level + 1), 20, 60);
    ctx.fillText('Difficulty: ' + difficulty, 20, 90);
}

export let showPrompt = true;
setTimeout(() => showPrompt = false, 10000);

export function drawPrompt(ctx) {
    if (!showPrompt) return;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(400, 20, 380, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText('Tip: Rotate cluster with mouse wheel or ↑/↓ keys.', 410, 45);
}
