const express = require('express');
const Itinerary = require('./itinerary.model');
const CustomError = require('../../customError');
const router = express.Router();

// Middleware to validate mandatory fields
const validateItinerary = (req, res, next) => {
    // Add validation logic here
    next();
};

// POST /api/v1/itinerary - create itinerary
router.post('/', validateItinerary, async (req, res, next) => {
    try {
        const newItinerary = new Itinerary(req.body);
        await newItinerary.save()
            .then(itinerary => res.json(itinerary))
            .catch(err => next(new CustomError(400, 'Save Error: ' + err)));
        } catch (err) {
            next(new CustomError(500, "Create itinerary error" + err.message));
        }
});

// GET /api/v1/itinerary - display everything
router.get('/', async (req, res, next) => {
    try {
        const itineraries = await Itinerary.find();
        res.json(itineraries);
    } catch (err) {
        next(err);
    }
});

// GET /api/v1/itinerary/:id - display particular itinerary by ID
router.get('/:id', async (req, res, next) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);
        if (!itinerary) return res.status(404).send('Itinerary not found');
        res.json(itinerary);
    } catch (err) {
        next(err);
    }
});

// PUT /api/v1/itinerary/:id - update particular itinerary by ID
router.put('/:id', validateItinerary, async (req, res, next) => {
    try {
        const updatedItinerary = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItinerary) return res.status(404).send('Itinerary not found');
        res.json(updatedItinerary);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/v1/itinerary/:id - delete particular itinerary by ID
router.delete('/:id', async (req, res, next) => {
    try {
        const itinerary = await Itinerary.findByIdAndDelete(req.params.id);
        if (!itinerary) return res.status(404).send('Itinerary not found');
        res.status(200).send('Itinerary deleted');
    } catch (err) {
        next(err);
    }
});

module.exports = router;