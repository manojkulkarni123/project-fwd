const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');

// Create new donation
router.post('/', async (req, res) => {
    try {
        const { orgId } = req.user; // From auth middleware
        const donationData = req.body;

        // Get restaurant name
        const restaurant = await User.findOne({ orgId });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const donation = new Donation({
            ...donationData,
            restaurantId: orgId,
            restaurantName: restaurant.name,
            status: 'available'
        });

        await donation.save();
        res.status(201).json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all available donations
router.get('/available', async (req, res) => {
    try {
        const donations = await Donation.find({ status: 'available' })
            .sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get restaurant's donations
router.get('/my-donations', async (req, res) => {
    try {
        const { orgId } = req.user;
        const donations = await Donation.find({ restaurantId: orgId })
            .sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get NGO's claimed donations
router.get('/claimed', async (req, res) => {
    try {
        const { orgId } = req.user;
        const donations = await Donation.find({ 
            claimedBy: orgId,
            status: { $in: ['claimed', 'completed'] }
        }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Claim a donation
router.post('/:id/claim', async (req, res) => {
    try {
        const { orgId } = req.user;
        const donationId = req.params.id;

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.status !== 'available') {
            return res.status(400).json({ message: 'Donation is not available' });
        }

        donation.status = 'claimed';
        donation.claimedBy = orgId;
        donation.claimedTime = new Date();
        await donation.save();

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Complete a donation
router.post('/:id/complete', async (req, res) => {
    try {
        const { orgId } = req.user;
        const donationId = req.params.id;

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.status !== 'claimed') {
            return res.status(400).json({ message: 'Donation must be claimed first' });
        }

        if (donation.claimedBy !== orgId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        donation.status = 'completed';
        donation.completedTime = new Date();
        await donation.save();

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel a donation
router.post('/:id/cancel', async (req, res) => {
    try {
        const { orgId } = req.user;
        const donationId = req.params.id;

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.restaurantId !== orgId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (donation.status !== 'available') {
            return res.status(400).json({ message: 'Can only cancel available donations' });
        }

        donation.status = 'cancelled';
        donation.cancelledTime = new Date();
        await donation.save();

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search donations by location
router.get('/search', async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query; // radius in kilometers

        const donations = await Donation.find({
            status: 'available',
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000 // convert to meters
                }
            }
        }).sort({ createdAt: -1 });

        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 