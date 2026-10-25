import express from "express";

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

export default app;