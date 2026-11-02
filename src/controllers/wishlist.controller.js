
import {
    addToWishlist as addToWishlistService,
    getWishlist as getWishlistService,
    removeWishlistItem as removeWishlistItemService,
    checkWishlistStatus as checkWishlistStatusService,
} from "../services/wishlist.service.js";

export const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;

        if (!productId || typeof productId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }

        const wishlistItem = await addToWishlistService(
            req.user.userId,
            productId
        );

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist successfully",
            data: wishlistItem,
        });
    } catch (error) {
        if (error.message === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (error.message === "PRODUCT_ALREADY_WISHLISTED") {
            return res.status(409).json({
                success: false,
                message: "Product is already in your wishlist",
            });
        }

        next(error);
    }
};


export const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await getWishlistService(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Wishlist fetched successfully",
            data: wishlist,
        });
    } catch (error) {
        next(error);
    }
};

export const removeWishlistItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;

        const removedItem = await removeWishlistItemService(
            req.user.userId,
            itemId
        );

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist successfully",
            data: removedItem,
        });
    } catch (error) {
        if (error.message === "WISHLIST_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found",
            });
        }

        if (error.message === "WISHLIST_ITEM_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Wishlist item not found",
            });
        }

        next(error);
    }
};

export const checkWishlistStatus = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const status = await checkWishlistStatusService(
            req.user.userId,
            productId
        );

        return res.status(200).json({
            success: true,
            message: "Wishlist status fetched successfully",
            data: status,
        });
    } catch (error) {
        next(error);
    }
};