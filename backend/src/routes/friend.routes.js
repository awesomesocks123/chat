import express from "express";
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest, 
  cancelFriendRequest,
  removeFriend, 
  getRandomUser, 
  getFriends, 
  getActiveChats,
  getReceivedFriendRequests,
  getSentFriendRequests
} from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Friend management routes
router.post("/request/send", sendFriendRequest);
router.post("/request/accept", acceptFriendRequest);
router.post("/request/decline", declineFriendRequest);
router.post("/request/cancel", cancelFriendRequest);
router.delete("/remove/:userId", removeFriend);
router.get("/list", getFriends);
router.get("/requests/received", getReceivedFriendRequests);
router.get("/requests/sent", getSentFriendRequests);

// Random chat and active chats
router.get("/random", getRandomUser);
router.get("/active-chats", getActiveChats);

export default router;
