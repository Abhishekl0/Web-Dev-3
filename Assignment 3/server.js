const express = require("express");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");

const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();


// Middleware
app.use(express.json());


// Home Route
app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Inventory Management API is running"
    });

});


// Product Routes
app.use("/api/products", productRoutes);


// 404 Route
app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });

});


// Centralized Error Handler
app.use(errorHandler);


// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {

    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

};

startServer();