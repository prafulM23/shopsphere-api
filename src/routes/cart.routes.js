
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { addToCart, getCart, updateCartQuantity, removeCartItem, clearCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.patch("/:itemId", authMiddleware, updateCartQuantity);
router.delete("/:itemId", authMiddleware, removeCartItem);
router.delete("/", authMiddleware, clearCart);
export default router;
