const User = require('../models/Usermodel');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');



const signup = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
      
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user' // Default to 'user'
        });



        await newUser.save();

        res.status(201).json({ 
            message: 'User created successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




//login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        user.refreshToken = refreshToken;
        await user.save();

        res.json({ accessToken, refreshToken, userId: user._id, role: user.role }); // Include role in the response
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getAllUsers= async(req,res)=>{
    try{
        const users =await User.find()
        res.status(200).json(users);


    }catch(error){
      res.status(500).json({message:error.message})
    }
}


//add User---signup

//update User

const updateUser = async (req, res) => {
    const { id } = req.params; // Get user ID from request params
    const { name, email, password } = req.body;

    try {
        // Fetch the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update only provided fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10); 

        // Save updated user data
        await user.save();

        // Remove the password from the response for security
        const updatedUser = user.toObject();
        delete updatedUser.password;

        // Return the updated user data
        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser // Send updated user data to the frontend
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete a user controller
const deleteUser = async (req, res) => {
    const { id } = req.params; // Get user ID from request parameters

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//dashboard 
const getUserDashboard = async (req, res) => {
    try {
        const user = req.user; // Use the user from the authenticated request
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user); // Send user data as response
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token) return res.sendStatus(401); // Unauthorized

    try {
        const user = await User.findOne({ refreshToken: token });
        if (!user) return res.sendStatus(403); // Forbidden

        // Verify the refresh token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(403); // Forbidden

            // Generate a new access token
            const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ accessToken });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Logout Functionality
const logout = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ refreshToken: token });
        if (!user) return res.sendStatus(403); // Forbidden

        // Clear refresh token
        user.refreshToken = null;
        await user.save();

        res.sendStatus(204); // No Content
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// controllers/UserController.js
const updateUserRole = async (req, res) => {
    const { id } = req.params; // User ID from URL
    const { role } = req.body; // New role from request body

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update role only if it is 'admin' or 'user'
        if (['user', 'admin'].includes(role)) {
            user.role = role; // Update role
            await user.save();
            return res.status(200).json({ message: 'User role updated successfully', user });
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    signup,
    login,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserDashboard,
    refreshToken, // Add this to exported functions
    logout, // Add this to exported functions
    updateUserRole 
};

