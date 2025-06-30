import express from "express";
import { addFriend, removeFriend, getRandomUser, getFriends, getActiveChats } from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Friend management routes
router.post("/add", addFriend);
router.delete("/remove/:userId", removeFriend);
router.get("/list", getFriends);

// Random chat and active chats
router.get("/random", getRandomUser);
router.get("/active-chats", getActiveChats);

export default router;
