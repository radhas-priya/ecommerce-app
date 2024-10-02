// routes/UserRoutes.js
const express = require("express");
const router = express.Router();
const {
    signup,
    login,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserDashboard,
    refreshToken,
    logout,
    updateUserRole
} = require("../controllers/UserController");
const auth = require("../middleware/auth"); // Import the auth middleware
const isAdmin = require("../middleware/isAdmin"); // Admin middleware

// Public Routes
router.post("/signupUser", signup);
router.post("/loginUser", login);

// Protected Routes
router.get("/getAllUsers", auth,isAdmin,  getAllUsers); // Admin-only route
router.put("/updateUser/:id", auth, updateUser); // Users can update their info
router.delete("/deleteUser/:id", auth, isAdmin, deleteUser); // Admin-only route
router.get("/dashboard/:id", auth, getUserDashboard); // User-specific dashboard

router.post("/refresh-token", refreshToken);
router.post("/logout", auth, logout);

// Role Management
router.put("/updateUserRole/:id", auth, isAdmin, updateUserRole); // Only admins can update user roles

module.exports = router;
