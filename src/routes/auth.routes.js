
import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";

const router = Router();

//http://localhost:5000/api/auth/signup
router.post("/signup", signup);

//http://localhost:5000/api/auth/login
router.post("/login", login);
export default router;
