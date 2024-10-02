const Order = require('../models/Ordermodel');
const Product = require('../models/Productmodel');
const User = require('../models/Usermodel');

// Create a new order
// Create a new order
exports.createOrder = async (req, res) => {
  const userId = req.user._id;  // User who is placing the order
  const productOrders = req.body.products;  // Expect an array of { productId, quantity }

  try {
    let totalAmount = 0;
    const orderProducts = await Promise.all(productOrders.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error('Product not found');
      totalAmount += product.price * item.quantity;

      await Product.findByIdAndUpdate(product._id, { $inc: { sold: item.quantity } });

      return {
        product: product._id,
        quantity: item.quantity
      };
    }));

    // Create and save the order with the user field
    const newOrder = new Order({
      user: userId,  // Ensure user is set here
      products: orderProducts,
      totalAmount,
      status: 'pending'
    });

    const savedOrder = await newOrder.save();

    // Push order to user's order list
    await User.findByIdAndUpdate(userId, {
      $push: { orders: savedOrder._id }
    });

    // Call the updateDashboardMetrics function for the product owner (admin)
    const productOwnerIds = orderProducts.map(product => product.productOwner);  // Get the owners of the products in the order
    for (const ownerId of productOwnerIds) {
      await updateDashboardMetrics(ownerId);  // Update the owner's dashboard metrics
    }

    res.status(201).json({ message: 'Order placed successfully', order: savedOrder });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
  
};



// Function to update dashboard metrics for a user
// Function to update dashboard metrics for a user
const updateDashboardMetrics = async (userId) => {
  try {
    // Get all products owned by this user (admin)
    const userProducts = await Product.find({ user: userId }).select('_id');

    const productIds = userProducts.map(product => product._id);

    // Calculate total sales for this admin's products (based on completed orders)
    const totalSales = await Order.aggregate([
      { $match: { 'products.product': { $in: productIds }, status: "completed" } },
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
    ]);

    // Count all orders containing this admin's products
    const totalOrders = await Order.countDocuments({ 'products.product': { $in: productIds } });

    // Count pending orders containing this admin's products
    const pendingOrders = await Order.countDocuments({ 'products.product': { $in: productIds }, status: "pending" });

    // Update the product owner's metrics in the user model
    await User.findByIdAndUpdate(userId, {
      totalSales: totalSales[0]?.totalSales || 0,
      totalOrders,
      pendingOrders,
    });

  } catch (error) {
    console.error('Error updating dashboard metrics:', error);
  }
};


exports.getOrders = async (req, res) => {
  const userId = req.user._id;
  console.log("Fetching orders for user:", userId); // Debugging log

  try {
    const orders = await Order.find({ user: userId }).populate('products.product');
    console.log("Orders found:", orders); // Log orders
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};


exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params; // Get the order ID from the URL
  const { status } = req.body;    // Get the new status (e.g., 'completed')

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};
