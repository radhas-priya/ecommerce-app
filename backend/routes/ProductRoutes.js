const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductControllers");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin"); // Import isAdmin middleware

// Add Product (admin only)
router.post("/add", auth, isAdmin, ProductController.addProduct);

// Delete Product (admin only)
router.delete("/delete/:id", auth, isAdmin, ProductController.deleteProduct);

// Update Product (admin only)
router.put("/update/:id", auth, isAdmin, ProductController.updateProduct);

// Get all products of the authenticated user (can be modified if required)
router.get("/my-products", auth, ProductController.getUserProducts);

router.get("/all-products", ProductController.getAllProducts); 

module.exports = router;
