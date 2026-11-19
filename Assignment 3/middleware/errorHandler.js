const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || res.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(error => error.message)
            .join(", ");
    }

    // Duplicate SKU error
    if (err.code === 11000) {
        statusCode = 400;
        message = "SKU already exists";
    }

    // Invalid MongoDB ID
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid Product ID";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;