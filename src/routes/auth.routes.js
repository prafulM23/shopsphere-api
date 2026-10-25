
import { Router } from "express";
import { signup, login, forgotPassword, verifyOTP, resetPasswordController, } from "../controllers/auth.controller.js";

const router = Router();

//http://localhost:5000/api/auth/signup
router.post("/signup", signup);

//http://localhost:5000/api/auth/login
router.post("/login", login);

//http://localhost:5000/api/auth/forgot
router.post("/forgot", forgotPassword);

//http://localhost:5000/api/auth/verify-otp
router.post("/verify-otp", verifyOTP);

//http://localhost:5000/api/auth/reset-password
router.post("/reset-password", resetPasswordController);
export default router;
