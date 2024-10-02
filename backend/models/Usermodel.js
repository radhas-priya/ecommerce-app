const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true,
        unique: true  // Ensure unique email addresses
    },
    password: {
        type: String,
        required: true 
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }],
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    refreshToken: { // New field for refresh token
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Define roles
        default: 'user' // Default role is 'user'
    },
    totalSales: { type: Number, default: 0 }, // New field
    totalOrders: { type: Number, default: 0 }, // New field
});

module.exports = mongoose.model("User", UserSchema);
