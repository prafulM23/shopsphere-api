
import { Router } from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    deleteProduct
} from "../controllers/product.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", upload.single("image"), createProduct);
router.delete("/:id", deleteProduct);
export default router;
