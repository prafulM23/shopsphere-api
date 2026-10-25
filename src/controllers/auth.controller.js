
import { validateLogin, validateSignup } from "../validators/auth.validator.js";
import { createUser, loginUser } from "../services/auth.service.js";

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