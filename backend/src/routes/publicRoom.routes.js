import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    getAllPublicRooms,
    getRoomsByCategory,
    joinRoom,
    leaveRoom,
    sendMessageToRoom,
    getRoomMessages,
}
from "../controllers/publicRoom.controller.js";

const router = express.Router();

// Public routes

router.get("/", getAllPublicRooms);
router.get("/category/:category", getRoomsByCategory);


//Protected routes
router.use(protectRoute);

router.post("/join/:roomId", joinRoom);
router.post("/leave/:roomId", leaveRoom);
router.post("/send/:roomId", sendMessageToRoom);
router.get("/:roomId", getRoomMessages);

export default router;
