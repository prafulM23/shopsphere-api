import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getProfile } from "../controllers/user.controller.js";

const router = Router();

//http://localhost:5000//api/users/me
router.get("/me", authMiddleware, getProfile);

export default router;