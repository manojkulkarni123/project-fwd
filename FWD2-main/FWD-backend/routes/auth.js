const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register user
router.post("/register", async (req, res) => {
    try {
        console.log("Register request:", req.body);
        const user = new User(req.body);
        await user.save();

        const token = jwt.sign(
            { userId: user._id, orgId: user.orgId, type: user.type },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "24h" }
        );

        res.json({
            token,
            user: {
                orgId: user.orgId,
                name: user.name,
                email: user.email,
                type: user.type
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Login user
router.post("/login", async (req, res) => {
    try {
        console.log("Login request:", req.body);
        const { orgId, password } = req.body;

        // Find user
        const user = await User.findOne({ orgId: orgId.toUpperCase() });
        console.log("Found user:", user ? user.orgId : null);
        
        if (!user) {
            return res.status(401).json({ message: "Invalid Organization ID or password" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log("Password match:", isMatch);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Organization ID or password" });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, orgId: user.orgId, type: user.type },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "24h" }
        );

        res.json({
            token,
            user: {
                orgId: user.orgId,
                name: user.name,
                email: user.email,
                type: user.type
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        const { orgId } = req.user; // From auth middleware
        const updates = req.body;

        // Remove sensitive fields
        delete updates.password;
        delete updates.orgId;
        delete updates.type;

        const user = await User.findOneAndUpdate(
            { orgId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                orgId: user.orgId,
                name: user.name,
                email: user.email,
                type: user.type,
                phone: user.phone,
                description: user.description,
                location: user.location
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const { orgId } = req.user; // From auth middleware
        const user = await User.findOne({ orgId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                orgId: user.orgId,
                name: user.name,
                email: user.email,
                type: user.type,
                phone: user.phone,
                description: user.description,
                location: user.location
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 