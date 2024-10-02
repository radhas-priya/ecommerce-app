const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config();

// Importing Routes
const userRoutes = require('./routes/UserRoutes');
const orderRoutes = require('./routes/OrderRoutes');
const productRoutes = require('./routes/ProductRoutes'); // Import the new Product routes
const dashboardRoutes = require('./routes/DashboradmetRoutes');
// const cartRoutes=require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User and Order routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Product routes (new addition)
app.use('/api/products', productRoutes); // Use the product routes
app.use('/api/dashboard', dashboardRoutes);
// app.use('/api', cartRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
