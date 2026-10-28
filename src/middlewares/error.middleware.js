
const errorHandler = (err, req, res, next) => {
    console.error("API ERROR:", err);

    if (res.headersSent) {
        return next(err);
    }

    return res.status(err.status || 500).json({
        success: false,
        message:
            err.status && err.status < 500
                ? err.message
                : "Internal server error",
    });
};

export default errorHandler;
