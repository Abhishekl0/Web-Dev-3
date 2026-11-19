const express = require("express");

const router = express.Router();

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getCategorySummary,
    adjustStock
} = require("../controllers/productController");

const asyncHandler = require("../middleware/asyncHandler");


// CREATE PRODUCT
router.post("/", asyncHandler(createProduct));

// GET ALL PRODUCTS
router.get("/", asyncHandler(getProducts));

// LOW STOCK REPORT
router.get("/low-stock", asyncHandler(getLowStockProducts));

// CATEGORY SUMMARY
router.get("/category-summary", asyncHandler(getCategorySummary));

// RESTOCK AND SALE
router.patch("/:id/stock", asyncHandler(adjustStock));

// GET SINGLE PRODUCT
router.get("/:id", asyncHandler(getProductById));

// UPDATE PRODUCT
router.put("/:id", asyncHandler(updateProduct));

// DELETE PRODUCT
router.delete("/:id", asyncHandler(deleteProduct));


module.exports = router;