const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ItinerarySchema = new Schema({
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    adults: { type: Number, required: true },
    children: { type: Number, required: true },
    budget: { type: Number, required: true },
    userID: { type: String, required: true }, // assuming reference to Users model
    flights: [{
        _id: { type: Schema.Types.ObjectId, auto: true },
        airline: String,
        flightNumber: String,
        departureDate: Date,
        departureTime: String,
        confirmationNumber: String,
        price: Number,
        notes: String
    }],
    hotels: [{
        _id: { type: Schema.Types.ObjectId, auto: true },
        name: String,
        addressLine1: String,
        phone: String,
        checkInDate: Date,
        checkInTime: String,
        confirmationNumber: String,
        price: Number,
        notes: String
    }],
    activities: [{
        _id: { type: Schema.Types.ObjectId, auto: true },
        name: String,
        addressLine1: String,
        addressLine2: String,
        activityDate: Date,
        activityTime: String,
        confirmationNumber: String,
        price: Number,
        notes: String
    }]
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);
