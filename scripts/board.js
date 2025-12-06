// board.js
import { targetPentagons, rackClusters, tryPlaceCluster, checkSolvable } from './state.js';
import { PENT_SIZE, rotatePoint } from './geometry.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let dragTarget = null;

// --- Drag and rotate ---
canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    for (const cl of rackClusters) {
        for (const idx of cl.cells) {
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
    checkSolvable();
    dragTarget = null;
});

canvas.addEventListener('wheel', e => {
    if (!dragTarget) return;
    e.preventDefault();
    dragTarget.rotation += e.deltaY > 0 ? 0.1 : -0.1;
});

document.addEventListener('keydown', e => {
    if (!dragTarget) return;
    if (e.key === 'ArrowUp') dragTarget.rotation += 0.1;
    if (e.key === 'ArrowDown') dragTarget.rotation -= 0.1;
});

// --- Drawing ---
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

export function drawBoard(ctx) {
    targetPentagons.forEach(p => drawPentagon(ctx, p.x, p.y, PENT_SIZE, p.placed ? '#44aa44' : '#333333'));
}

export function drawClusters(ctx) {
    rackClusters.forEach(cl => {
        cl.cells.forEach(idx => {
            const dx = targetPentagons[idx].x - targetPentagons[cl.cells[0]].x;
            const dy = targetPentagons[idx].y - targetPentagons[cl.cells[0]].y;
            const [rx, ry] = rotatePoint(dx, dy, cl.rotation || 0);
            const px = cl.x + rx;
            const py = cl.y + ry;
            drawPentagon(ctx, px, py, PENT_SIZE, cl.dragging ? '#ffff00' : '#ffaa44');
        });
    });
}
