const { getRooms, getRoom, updateRoom, createNewRoom } = require('../services/roomService');
const { sendToOnePlayerRooms, sendToOnePlayerData, sendWinner } = require('../socket/emits');
const socketManager = require('../socket/socketManager');

module.exports = socket => {
    const req = socket.request;

    const handleGetData = async () => {
        const room = await getRoom(req.session.roomId);
        // Handle the situation when the server crashes and any player reconnects after the time has expired
        // Typically, the responsibility for changing players is managed by gameHandler.js.
        if (room.nextMoveTime <= Date.now()) {
            room.changeMovingPlayer();
            await updateRoom(room);
        }
        sendToOnePlayerData(socket.id, room);
        
        // Send current scores if game has started
        if (room.started) {
            room.updatePlayerScores();
            const scoreObject = {};
            room.playerScores.forEach((score, playerId) => {
                scoreObject[playerId] = score;
            });
            
            socketManager.getIO()
                .to(room._id.toString())
                .emit("game:scores", scoreObject);
        }
        
        if (room.winner) sendWinner(socket.id, room.winner);
    };

    const handleGetAllRooms = async () => {
        const rooms = await getRooms();
        sendToOnePlayerRooms(socket.id, rooms);
    };

    const handleCreateRoom = async data => {
        await createNewRoom(data);
        sendToOnePlayerRooms(socket.id, await getRooms());
    };

    socket.on('room:data', handleGetData);
    socket.on('room:rooms', handleGetAllRooms);
    socket.on('room:create', handleCreateRoom);
};
