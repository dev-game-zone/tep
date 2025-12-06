import { targetPentagons, rackClusters } from './state.js';

export function getDifficulty() {
    const empty = targetPentagons.filter(p => !p.placed);
    if (empty.length === 0) return "Completed";

    const anyPlaced = targetPentagons.some(p => p.placed);
    if (!anyPlaced) return "Easy";

    // Simple heuristic for prototype
    const score = empty.length / (rackClusters.length || 1);
    if (score < 1.5) return "Easy";
    if (score < 2.5) return "Medium";
    if (score < 3.5) return "Hard";
    return "Extreme";
}
