const Order = require("../models/Ordermodel");
const Product = require("../models/Productmodel");

const getDashboardMetrics = async (req, res) => {
  const userId = req.params.id;  // Get user ID from request params
  
  try {
    // Get all products owned by the user (admin)
    const userProducts = await Product.find({ user: userId }).select('_id');

    const productIds = userProducts.map(product => product._id);

    // Calculate total sales (sum of completed orders for products owned by this user)
    const totalSales = await Order.aggregate([
      { $match: { 'products.product': { $in: productIds }, status: "completed" } },  // Match orders containing user's products
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
    ]);

    // Calculate total orders for the user's products
    const totalOrders = await Order.countDocuments({ 'products.product': { $in: productIds } });

    // Calculate pending orders for the user's products
    const pendingOrders = await Order.countDocuments({ 'products.product': { $in: productIds }, status: "pending" });

    // Calculate average order value (based on completed orders for the user's products)
    const completedOrders = await Order.countDocuments({ 'products.product': { $in: productIds }, status: "completed" });
    const averageOrderValue = totalSales[0]?.totalSales / completedOrders || 0;

    // Get total product views for the user's products
    const productViews = await Product.aggregate([
      { $match: { user: userId } },  // Filter products by user
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    // Get total product sales from completed orders
    const totalProductSales = await Order.aggregate([
      { $match: { 'products.product': { $in: productIds }, status: "completed" } },  // Only completed orders
      { $unwind: "$products" },  // Unwind products array to get individual products
      { $match: { 'products.product': { $in: productIds } } },  // Only products owned by this user
      { $group: { _id: "$products.product", totalSold: { $sum: "$products.quantity" } } },
      { $group: { _id: null, totalSold: { $sum: "$totalSold" } } }  // Sum all sold quantities
    ]);

    // Return all metrics
    res.json({
      totalSales: totalSales[0]?.totalSales || 0,
      totalOrders,
      pendingOrders,
      averageOrderValue,
      totalViews: productViews[0]?.totalViews || 0,
      totalProductSales: totalProductSales[0]?.totalSold || 0
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching metrics", error });
  }
};

module.exports = { getDashboardMetrics };
