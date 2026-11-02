
import prisma from "../config/prisma.js";

export const addToWishlist = async (userId, productId) => {
    // Check whether product exists
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
    }

    // Create wishlist if it does not exist
    const wishlist = await prisma.wishlist.upsert({
        where: { userId },
        update: {},
        create: { userId },
    });

    // Check whether product is already wishlisted
    const existingItem = await prisma.wishlistItem.findUnique({
        where: {
            wishlistId_productId: {
                wishlistId: wishlist.id,
                productId,
            },
        },
    });

    if (existingItem) {
        throw new Error("PRODUCT_ALREADY_WISHLISTED");
    }

    return await prisma.wishlistItem.create({
        data: {
            wishlistId: wishlist.id,
            productId,
        },
        include: {
            product: true,
        },
    });
};

export const getWishlist = async (userId) => {
    const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            price: true,
                            stock: true,
                            imageUrl: true,
                            category: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    return {
        items: wishlist?.items || [],
        totalItems: wishlist?.items.length || 0,
    };
};

export const removeWishlistItem = async (userId, itemId) => {
    const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
    });

    if (!wishlist) {
        throw new Error("WISHLIST_NOT_FOUND");
    }

    const wishlistItem = await prisma.wishlistItem.findFirst({
        where: {
            id: itemId,
            wishlistId: wishlist.id,
        },
    });

    if (!wishlistItem) {
        throw new Error("WISHLIST_ITEM_NOT_FOUND");
    }

    await prisma.wishlistItem.delete({
        where: { id: wishlistItem.id },
    });

    return wishlistItem;
};

export const checkWishlistStatus = async (userId, productId) => {
    const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
    });

    if (!wishlist) {
        return { isWishlisted: false };
    }

    const wishlistItem = await prisma.wishlistItem.findUnique({
        where: {
            wishlistId_productId: {
                wishlistId: wishlist.id,
                productId,
            },
        },
    });

    return {
        isWishlisted: Boolean(wishlistItem),
    };
};