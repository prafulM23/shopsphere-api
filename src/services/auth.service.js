
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "./email.service.js";
import crypto from "node:crypto";


export const createUser = async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (existingUser) {
        const error = new Error("An account with this email already exists");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    return user;
};


export const loginUser = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        },
        token,
    };
};


export const requestPasswordReset = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });

    if (!user) {
        return;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.passwordResetOTP.deleteMany({
        where: { email: normalizedEmail },
    });

    await prisma.passwordResetOTP.create({
        data: {
            email: normalizedEmail,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
    });

    await sendOTPEmail(normalizedEmail, otp);
};

export const verifyResetOTP = async ({ email, otp }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const resetRecord = await prisma.passwordResetOTP.findFirst({
        where: { email: normalizedEmail },
        orderBy: { createdAt: "desc" },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 400;
        throw error;
    }

    const isOTPValid = await bcrypt.compare(otp, resetRecord.otpHash);

    if (!isOTPValid) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 400;
        throw error;
    }

    return { email: normalizedEmail };
};

export const resetPassword = async ({ email, otp, newPassword }) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (typeof newPassword !== "string" || newPassword.length < 8) {
        const error = new Error("Password must be at least 8 characters long");
        error.statusCode = 400;
        throw error;
    }

    const resetRecord = await prisma.passwordResetOTP.findFirst({
        where: { email: normalizedEmail },
        orderBy: { createdAt: "desc" },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 400;
        throw error;
    }

    const isOTPValid = await bcrypt.compare(otp, resetRecord.otpHash);

    if (!isOTPValid) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
        prisma.user.update({
            where: { email: normalizedEmail },
            data: { password: hashedPassword },
        }),
        prisma.passwordResetOTP.deleteMany({
            where: { email: normalizedEmail },
        }),
    ]);
};
