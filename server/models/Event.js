const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    date: {
        type: String, // Storing as string for flexibility initially, or Date if parsed
    },
    location: String,
    imageUrl: String,
    originalUrl: {
        type: String,
        unique: true, // Prevent duplicates
        required: true,
    },
    description: String,
    organizer: String,
    scrapedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Event', eventSchema);