
import prisma from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";

export const createProduct = async (req, res, next) => {
    let uploadedImagePublicId;

    try {
        const { name, description, price, stock, imageUrl, category } =
            req.body ?? {};

        if (
            typeof name !== "string" ||
            !name.trim() ||
            price === undefined ||
            price === null ||
            price === "" ||
            !Number.isFinite(Number(price)) ||
            Number(price) <= 0 ||
            (stock !== undefined &&
                (!Number.isInteger(Number(stock)) || Number(stock) < 0))
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid name, positive price, and non-negative stock are required",
            });
        }

        let finalImageUrl =
            typeof imageUrl === "string" && imageUrl.trim()
                ? imageUrl.trim()
                : null;

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "shopsphere/products",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );

                stream.end(req.file.buffer);
            });

            finalImageUrl = result.secure_url;
            uploadedImagePublicId = result.public_id;
        }

        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                description:
                    typeof description === "string" && description.trim()
                        ? description.trim()
                        : null,
                price: Number(price),
                stock: stock === undefined ? 0 : Number(stock),
                imageUrl: finalImageUrl,
                category:
                    typeof category === "string" && category.trim()
                        ? category.trim()
                        : null,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: { product },
        });
    } catch (error) {
        if (uploadedImagePublicId) {
            try {
                await cloudinary.uploader.destroy(uploadedImagePublicId);
            } catch (cleanupError) {
                console.error("Cloudinary cleanup failed:", cleanupError.message);
            }
        }

        next(error);
    }
};



export const getProducts = async (req, res, next) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            results: products.length,
            data: { products },
        });
    } catch (error) {
        next(error);
    }
};


export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};


export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Delete the product from the database
        await prisma.product.delete({
            where: { id },
        });

        // Delete its Cloudinary image, if available
        if (product.imageUrl) {
            try {
                const url = new URL(product.imageUrl);
                const uploadPath = url.pathname.split("/upload/")[1];

                if (uploadPath) {
                    const publicId = uploadPath
                        .replace(/^v\d+\//, "")
                        .replace(/\.[^/.]+$/, "");

                    await cloudinary.uploader.destroy(publicId);
                }
            } catch (imageError) {
                console.error(
                    "Cloudinary image cleanup failed:",
                    imageError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
