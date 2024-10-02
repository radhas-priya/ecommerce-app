const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },  // To track product views
  sold: { type: Number, default: 0 },   // To track product sales
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // Owner of the product
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
