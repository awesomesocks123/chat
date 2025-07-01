import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { blockUser, getBlockedUsers, unblockUser, reportUser } from "../controllers/blockedUser.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Block a user
router.post("/block/:userId", blockUser);

// Get all blocked users
router.get("/", getBlockedUsers);

// Unblock a user
router.delete("/unblock/:userId", unblockUser);

// Report a user
router.post("/report/:userId", reportUser);

export default router;
