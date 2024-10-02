const express = require("express");
const { getDashboardMetrics } = require("../controllers/DashboardControllers");
const auth = require("../middleware/auth"); 
const isAdmin =require("../middleware/isAdmin");
const router = express.Router();

router.get("/:id/metrics", getDashboardMetrics);

module.exports = router;
