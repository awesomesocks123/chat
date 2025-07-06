import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    getAllPublicRooms,
    getRoomsByCategory,
    getRoomById,
    joinRoom,
    leaveRoom,
    sendMessageToRoom,
    getRoomMessages,
    getRoomParticipants,
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
router.get("/:roomId/participants", getRoomParticipants);
// Get room details by ID
router.get("/room/:roomId", getRoomById);
// Get room messages
router.get("/:roomId/messages", getRoomMessages);

export default router;
