import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
    addToWishlist,
    getWishlist,
    removeWishlistItem,
    checkWishlistStatus,
} from "../controllers/wishlist.controller.js";

const router = express.Router();

router.post("/", authMiddleware, addToWishlist);
router.get("/", authMiddleware, getWishlist);
router.delete("/:itemId", authMiddleware, removeWishlistItem);
router.get("/:productId/status", authMiddleware, checkWishlistStatus);

export default router;