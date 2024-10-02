const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The user who placed the order
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, default: 1 }, // How many units were ordered
    }
  ],
  totalAmount: { type: Number, required: true },  // Total price for the order
  status: { type: String, enum: ["pending", "completed"], default: "pending" },  // Order status
  orderDate: { type: Date, default: Date.now },  // Date of the order
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

