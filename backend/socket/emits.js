const socketManager = require('./socketManager');

const sendToPlayersRolledNumber = (id, rolledNumber) => {
    socketManager.getIO().to(id).emit('game:roll', rolledNumber);
};

const sendToPlayersData = room => {
    socketManager.getIO().to(room._id.toString()).emit('room:data', room);
};

const sendToOnePlayerData = (id, room) => {
    socketManager.getIO().to(id).emit('room:data', room);
};

const sendToOnePlayerRooms = (id, rooms) => {
    socketManager.getIO().to(id).emit('room:rooms', rooms);
};

const sendWinner = (id, winner) => {
    socketManager.getIO().to(id).emit('game:winner', winner);
};

module.exports = {
    sendToPlayersData,
    sendToPlayersRolledNumber,
    sendToOnePlayerData,
    sendToOnePlayerRooms,
    sendWinner,
};
