
import { Router } from "express";
import { signup } from "../controllers/auth.controller.js";

const router = Router();

//http://localhost:5000/api/auth/signup
router.post("/signup", signup);

export default router;
