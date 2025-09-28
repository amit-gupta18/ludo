const { getRoom, updateRoom } = require('../services/roomService');
const { sendToPlayersRolledNumber, sendWinner } = require('../socket/emits');
const { rollDice, isMoveValid } = require('./handlersFunctions');
const { addPawnProgress, handleCapture, calculatePlayerScore } = require('../utils/scoring'); 
const socketManager = require('../socket/socketManager'); // needed for game:scores

module.exports = socket => {
    const req = socket.request;

    const handleMovePawn = async pawnId => {
        const room = await getRoom(req.session.roomId);
        if (room.winner) return;

        const pawn = room.getPawn(pawnId);

        if (isMoveValid(req.session, pawn, room)) {
            const rolledNumber = room.rolledNumber;

            // 1. Update pawn position
            const newPositionOfMovedPawn = pawn.getPositionAfterMove(rolledNumber);
            room.changePositionOfPawn(pawn, newPositionOfMovedPawn);

            // 2. Progress scoring
            addPawnProgress(pawn, rolledNumber);

            // 3. Capture scoring (if any)
            const capturedPawns = room.beatPawns(newPositionOfMovedPawn, req.session.color);
            if (capturedPawns && capturedPawns.length > 0) {
                capturedPawns.forEach(victim => {
                    handleCapture(pawn, victim);
                });
            }

            // 4. Update all player scores
            room.updatePlayerScores();

            // 5. Emit updated scores
            const scoreObject = {};
            room.playerScores.forEach((score, playerId) => {
                scoreObject[playerId] = score;
            });
            
            socketManager.getIO()
                .to(room._id.toString())
                .emit("game:scores", scoreObject);

            // 6. Next player turn
            room.changeMovingPlayer();

            // 7. Check winner
            const winner = room.getWinner();
            if (winner) {
                room.endGame(winner);
                sendWinner(room._id.toString(), winner);
            }

            await updateRoom(room);
        }
    };

    const handleRollDice = async () => {
        const rolledNumber = rollDice();
        sendToPlayersRolledNumber(req.session.roomId, rolledNumber);

        const room = await updateRoom({ _id: req.session.roomId, rolledNumber });
        const player = room.getPlayer(req.session.playerId);

        if (!player.canMove(room, rolledNumber)) {
            room.changeMovingPlayer();
            await updateRoom(room);
        }
    };

    socket.on('game:roll', handleRollDice);
    socket.on('game:move', handleMovePawn);
};
