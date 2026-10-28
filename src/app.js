import express from "express";
import prisma from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ShopSphere API is running",
    });
});
app.get("/api/test-db", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            success: true,
            message: "Database connected successfully",
        });
    } catch (error) {
        console.error("Database connection failed:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }

});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use(errorHandler);

export default app;