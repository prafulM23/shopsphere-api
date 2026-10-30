
import prisma from "../config/prisma.js";

export const addToCart = async (userId, productId, quantity) => {
    return await prisma.$transaction(async (tx) => {
        // Check whether product exists
        const product = await tx.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            const error = new Error("Product not found");
            error.status = 404;
            throw error;
        }

        // Validate stock
        if (product.stock < quantity) {
            const error = new Error("Insufficient product stock");
            error.status = 400;
            throw error;
        }

        // Find or create user's cart
        const cart = await tx.cart.upsert({
            where: { userId },
            update: {},
            create: { userId },
        });

        // Check whether product already exists in cart
        const existingItem = await tx.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });

        const newQuantity = (existingItem?.quantity || 0) + quantity;

        if (newQuantity > product.stock) {
            const error = new Error(
                `Only ${product.stock} units are available`
            );
            error.status = 400;
            throw error;
        }

        // Add new item or increase existing quantity
        return await tx.cartItem.upsert({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
            update: {
                quantity: newQuantity,
            },
            create: {
                cartId: cart.id,
                productId,
                quantity,
            },
            include: {
                product: true,
            },
        });
    });
};


export const getCart = async (userId) => {
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!cart) {
        return {
            items: [],
            totalItems: 0,
            totalAmount: 0,
        };
    }

    const totalItems = cart.items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalAmount = cart.items.reduce(
        (total, item) =>
            total + Number(item.product.price) * item.quantity,
        0
    );

    return {
        ...cart,
        totalItems,
        totalAmount: Number(totalAmount.toFixed(2)),
    };
};



export const updateCartQuantity = async (userId, itemId, quantity) => {
    return await prisma.$transaction(
        async (tx) => {
            const cartItem = await tx.cartItem.findFirst({
                where: {
                    id: itemId,
                    cart: {
                        userId,
                    },
                },
                include: {
                    product: true,
                },
            });

            if (!cartItem) {
                const error = new Error("Cart item not found");
                error.status = 404;
                throw error;
            }

            if (quantity > cartItem.product.stock) {
                const error = new Error(
                    `Only ${cartItem.product.stock} units are available`
                );
                error.status = 400;
                throw error;
            }

            return await tx.cartItem.update({
                where: {
                    id: itemId,
                },
                data: {
                    quantity,
                },
                include: {
                    product: true,
                },
            });
        },
        {
            maxWait: 10000,
            timeout: 20000,
        }
    );
};

export const removeCartItem = async (userId, itemId) => {
    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id: itemId,
            cart: {
                userId,
            },
        },
    });

    if (!cartItem) {
        const error = new Error("Cart item not found");
        error.status = 404;
        throw error;
    }

    await prisma.cartItem.delete({
        where: {
            id: itemId,
        },
    });

    return cartItem;
};


export const clearCart = async (userId) => {
    const cart = await prisma.cart.findUnique({
        where: { userId },
    });

    if (!cart) {
        return { count: 0 };
    }

    return await prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id,
        },
    });
};


