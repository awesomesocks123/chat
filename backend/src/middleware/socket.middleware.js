import { io } from '../lib/socket.js';

export const attachSocketIO = (req, res, next) => {
  req.io = io;
  next();
};
