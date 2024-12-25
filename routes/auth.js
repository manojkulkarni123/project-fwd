const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { orgId, type, name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ orgId: orgId.toUpperCase() }, { email }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Organization ID or email already exists' 
            });
        }

        // Create new user
        const user = new User({
            orgId: orgId.toUpperCase(),
            type,
            name,
            email,
            password
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id, orgId: user.orgId, type: user.type },
            'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                orgId: user.orgId,
                name: user.name,
                email: user.email,
                type: user.type
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { orgId, password } = req.body;
        console.log('Login attempt:', { orgId });

        // Find user
        const user = await User.findOne({ orgId: orgId.toUpperCase() });
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('User not found with orgId:', orgId);
            return res.status(401).json({ message: 'Invalid Organization ID or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch ? 'Yes' : 'No');

        if (!isMatch) {
            console.log('Password does not match for user:', orgId);
            return res.status(401).json({ message: 'Invalid Organization ID or password' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, orgId: user.orgId, type: user.type },
            'your-secret-key',
            { expiresIn: '24h' }
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
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 