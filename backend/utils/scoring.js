
function addPawnProgress(pawn, stepsMoved) {
    pawn.score += stepsMoved;
    return pawn.score;
}

function handleCapture(striker, victim) {
    // Add victim's score to striker
    striker.score += victim.score;
    striker.captures += 1;

    // Reset victim
    victim.score = 0;
    victim.position = victim.basePos; // reset to base
    
    return {
        strikerScore: striker.score,
        victimScore: victim.score
    };
}

function calculatePlayerScore(pawns) {
    return pawns.reduce((acc, pawn) => acc + pawn.score, 0);
}

module.exports = { addPawnProgress, handleCapture, calculatePlayerScore };
