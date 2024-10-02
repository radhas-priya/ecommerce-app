// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/Usermodel");

const auth = async (req, res, next) => {
  console.log("Authorization header:", req.header("Authorization")); 
  const token = req.header("Authorization").replace("Bearer ", "");

  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user; // Attach user to the request
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = auth;
