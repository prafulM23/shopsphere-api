
import {
    addToCart as addToCartService,
    getCart as getCartService,
    updateCartQuantity as updateCartQuantityService,
    removeCartItem as removeCartItemService,
    clearCart as clearCartService,
} from "../services/cart.service.js";

export const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body ?? {};

        if (
            typeof productId !== "string" ||
            !productId.trim() ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid productId and positive integer quantity are required",
            });
        }

        const cartItem = await addToCartService(
            req.user.userId,
            productId.trim(),
            quantity
        );

        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            data: { cartItem },
        });
    } catch (error) {
        next(error);
    }
};


export const getCart = async (req, res, next) => {
    try {
        const cart = await getCartService(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};


export const updateCartQuantity = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body ?? {};

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        const cartItem = await updateCartQuantityService(
            req.user.userId,
            itemId,
            quantity
        );

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            data: { cartItem },
        });
    } catch (error) {
        next(error);
    }
};


export const removeCartItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;

        const cartItem = await removeCartItemService(
            req.user.userId,
            itemId
        );

        return res.status(200).json({
            success: true,
            message: "Cart item removed successfully",
            data: { cartItem },
        });
    } catch (error) {
        next(error);
    }
};


export const clearCart = async (req, res, next) => {
    try {
        const result = await clearCartService(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: {
                deletedItems: result.count,
            },
        });
    } catch (error) {
        next(error);
    }
};

