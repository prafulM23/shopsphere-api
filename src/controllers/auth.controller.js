
import { validateLogin, validateSignup } from "../validators/auth.validator.js";
import { createUser, loginUser } from "../services/auth.service.js";
import { requestPasswordReset } from "../services/auth.service.js";
import { verifyResetOTP } from "../services/auth.service.js";
import { resetPassword } from "../services/auth.service.js";
export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body ?? {};
        const validation = validateSignup({
            name,
            email,
            password,
        });


        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.errors,
            });
        }

        const user = await createUser({
            name,
            email,
            password,
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body ?? {};

        const validation = validateLogin({
            email,
            password,
        });

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.errors,
            });
        }

        const user = await loginUser({
            email,
            password,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: user.user,
                token: user.token,
            },
        });

    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body ?? {};

        if (!email || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        await requestPasswordReset(email);

        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, an OTP has been sent",
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        next(error);
    }
};

export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body ?? {};

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof otp !== "string" ||
            !/^\d{6}$/.test(otp)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid email and 6-digit OTP are required",
            });
        }

        await verifyResetOTP({ email, otp });

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const resetPasswordController = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body ?? {};

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof otp !== "string" ||
            !/^\d{6}$/.test(otp) ||
            typeof newPassword !== "string" ||
            newPassword.length < 8
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid email, 6-digit OTP, and password of at least 8 characters are required",
            });
        }

        await resetPassword({ email, otp, newPassword });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        next(error);
    }
};