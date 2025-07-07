// This file provides a way to access the socket.io instance from other modules

let io;

export const initSocketIO = (socketIO) => {
  io = socketIO;
};

export const getSocketIO = () => {
  if (!io) {
    console.warn('Socket.IO has not been initialized yet');
    return null;
  }
  return io;
};
