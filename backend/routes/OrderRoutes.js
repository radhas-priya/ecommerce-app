const express = require('express');
const router = express.Router();
const { createOrder, getOrders,updateOrderStatus } = require('../controllers/OrderControllers');
const auth = require('../middleware/auth'); // Make sure to import your auth middleware


// Use auth middleware to protect the routes
router.post('/', auth, createOrder); // Protect the route
router.get('/',auth, getOrders); // Optionally, change :id to just /orders to get all orders for the user
router.put('/:orderId/status', auth, updateOrderStatus);

module.exports = router;
