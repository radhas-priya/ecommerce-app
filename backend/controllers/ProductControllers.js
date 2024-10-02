const Product = require("../models/Productmodel");
const User = require("../models/Usermodel");

// Add Product (admin only)
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, discount, image } = req.body;

    if (!req.user || !req.user.id || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const newProduct = new Product({
      name,
      description,
      image,
      price,
      discount,
      user: req.user.id,  // Ensure user is being set correctly
    });

    await newProduct.save();

    // Now push the product into the user's product field
    await User.findByIdAndUpdate(req.user.id, {
      $push: { products: newProduct._id }
    });

    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    console.error("Error adding product:", err); // Log any error
    res.status(500).json({ message: "Error adding product", error: err.message });
  }
};


// Delete Product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params; // Get the product ID from request parameters

    // Attempt to find and delete the product (admins can delete any product)
    const product = await Product.findByIdAndDelete(id);

    // If the product is not found, return a 404 error
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err); // Log any error for debugging
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};

// Update Product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // Product ID from the request parameters
    const updatedData = req.body; // Updated product data from the request body

    // Ensure the product exists and attempt to update it (admins can update any product)
    const product = await Product.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    // If no product is found, return a 404 error
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return the updated product
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("Error updating product:", err); // Log any error for debugging
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
};

// Fetch the user's products (only the authenticated user's products)
exports.getUserProducts = async (req, res) => {
  try {
    // Fetch only the products that belong to the authenticated user
    const products = await Product.find({ user: req.user.id });

    // If no products are found, return an empty array with a message
    if (!products || products.length === 0) {
      return res.status(200).json({ message: "No products found", products: [] });
    }

    // Return the user's products
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};



exports.getAllProducts=async(req,res)=>{
  try{
    const products =await Product.find().populate('user','name email');

    if(!products && products.length===0){
      return res.status(200).json({message:"no products found",products:[]})

    }
    res.status(200).json(products);
  

  }catch(error){
    res.status(500).json({message:"error fetching products",error:error.message})
  }

}