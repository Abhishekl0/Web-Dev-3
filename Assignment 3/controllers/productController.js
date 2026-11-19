const Product = require("../models/Product");

// CREATE PRODUCT
const createProduct = async (req, res) => {

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        message: "Product created successfully",
        product
    });
};


// GET ALL PRODUCTS - FILTERING, SORTING, PAGINATION
const getProducts = async (req, res) => {

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(
        Math.max(parseInt(req.query.limit) || 10, 1),
        100
    );

    const skip = (page - 1) * limit;

    let filter = {};

    // Category filter
    if (req.query.category) {
        filter.category = {
            $regex: req.query.category,
            $options: "i"
        };
    }

    // Search by name or SKU
    if (req.query.search) {
        filter.$or = [
            { name: { $regex: req.query.search, $options: "i" } },
            { sku: { $regex: req.query.search, $options: "i" } }
        ];
    }

    // Price filters
    if (req.query.minPrice || req.query.maxPrice) {

        filter.price = {};

        if (req.query.minPrice) {
            filter.price.$gte = Number(req.query.minPrice);
        }

        if (req.query.maxPrice) {
            filter.price.$lte = Number(req.query.maxPrice);
        }
    }

    // Sorting
    const sort = req.query.sort || "-createdAt";

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        count: products.length,
        products
    });
};


// GET SINGLE PRODUCT
const getProductById = async (req, res) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    res.status(200).json({
        success: true,
        product
    });
};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product
    });
};


// DELETE PRODUCT
const deleteProduct = async (req, res) => {

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    res.status(200).json({
        success: true,
        message: "Product deleted",
        id: product._id
    });
};


// LOW STOCK REPORT
const getLowStockProducts = async (req, res) => {

    const products = await Product.find({
        $expr: {
            $lte: ["$quantity", "$reorderLevel"]
        }
    });

    res.status(200).json({
        success: true,
        count: products.length,
        lowStockItems: products
    });
};


// CATEGORY WISE INVENTORY SUMMARY
const getCategorySummary = async (req, res) => {

    const summary = await Product.aggregate([
        {
            $group: {
                _id: "$category",

                totalProducts: {
                    $sum: 1
                },

                totalQuantity: {
                    $sum: "$quantity"
                },

                totalStockValue: {
                    $sum: {
                        $multiply: ["$price", "$quantity"]
                    }
                },

                averagePrice: {
                    $avg: "$price"
                }
            }
        },

        {
            $sort: {
                _id: 1
            }
        }
    ]);

    res.status(200).json({
        success: true,
        summary
    });
};


// RESTOCK AND SALE
const adjustStock = async (req, res) => {

    const { operation, quantity } = req.body;

    if (!["restock", "sale"].includes(operation)) {
        res.status(400);
        throw new Error("Operation must be restock or sale");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        res.status(400);
        throw new Error("Quantity must be a positive integer");
    }

    const change = operation === "restock" ? quantity : -quantity;

    const filter = {
        _id: req.params.id
    };

    if (operation === "sale") {
        filter.quantity = { $gte: quantity };
    }

    const product = await Product.findOneAndUpdate(
        filter,
        {
            $inc: {
                quantity: change
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!product) {

        const exists = await Product.exists({
            _id: req.params.id
        });

        if (!exists) {
            res.status(404);
            throw new Error("Product not found");
        }

        res.status(400);
        throw new Error("Insufficient stock available");
    }

    res.status(200).json({
        success: true,
        message: `Stock ${operation} successful`,
        product
    });
};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getCategorySummary,
    adjustStock
};