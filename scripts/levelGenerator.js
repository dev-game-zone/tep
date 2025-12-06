export function generateLevels(level) {
    const pentagons = [];
    const gridSize = 3 + level; // grows each level
    const spacing = 60;
    const offsetX = 200;
    const offsetY = 150;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            pentagons.push({ x: offsetX + col * spacing, y: offsetY + row * spacing, placed: false });
        }
    }
    return pentagons;
}
