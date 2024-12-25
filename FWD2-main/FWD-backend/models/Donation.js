const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    restaurantId: {
        type: String,
        required: true,
        ref: 'User'
    },
    foodType: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    expiryTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['available', 'claimed', 'completed', 'cancelled'],
        default: 'available'
    },
    location: {
        address: {
            type: String,
            required: true
        },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    notes: String,
    claimedBy: {
        type: String,
        ref: 'User'
    },
    claimedTime: Date,
    completedTime: Date,
    cancelledTime: Date,
    restaurantName: String
}, {
    timestamps: true
});

// Index for geospatial queries
donationSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Donation', donationSchema); 