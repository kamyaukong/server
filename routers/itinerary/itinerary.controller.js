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
            .catch(err => next(new CustomError(400, 'Error occured during Itinerary Save(): ' + err.message)));
        } catch (err) {
            next(new CustomError(500, 'Itinerary creation error' + err.message));
        }
});

// GET /api/v1/itinerary - display everything
router.get('/', async (req, res, next) => {
    Itinerary.find()
        .then(itineraries => res.json(itineraries))
        .catch(err => next(new CustomError(400, err.message)));
});

// GET /api/v1/itinerary/:id - display particular itinerary by ID
router.get('/:id', async (req, res, next) => {
    Itinerary.findById(req.params.id)
        .then(itinerary => res.json(itinerary))
        .catch(err => next(new CustomError(400, 'Itinerary [' + req.params.id + '] not found: ' + err.message)));
});

// PUT /api/v1/itinerary/:id - update particular itinerary by ID
router.put('/:id', validateItinerary, async (req, res, next) => {
    try {
        const itinerary = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!itinerary) {
            return next(new CustomError(404, 'Itinerary [' + req.params.id + '] not found for update operation.'));
        }
        res.json(itinerary);
    } catch (err) {
        next(new CustomError(500, 'Itinerary update error: ' + err.message));
    }
});

// DELETE /api/v1/itinerary/:id - delete particular itinerary by ID
router.delete('/:id', async (req, res, next) => {
    try {
        const itinerary = await Itinerary.findByIdAndDelete(req.params.id);
        if (!itinerary) {
            return next(new CustomError(404, 'Itinerary [' + req.params.id + '] not found for delete operation.'));
        }
        res.status(200).send('Itinerary [' + req.params.id +  '] has been deleted');
    } catch (err) {
        next(new CustomError(500, 'Itinerary deletion error: ' + err.message));
    }
});

module.exports = router;