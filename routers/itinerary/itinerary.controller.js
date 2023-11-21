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
    // console.log('Create document: ', req.body);

    try {
    
        const { items, ...mainDetails } = req.body;
        const { flights, hotels, activities } = splitItineraryItems(items);

        const newItineraryData = {
            ...mainDetails,
            flights,
            hotels,
            activities
        };

        const newItinerary = new Itinerary(newItineraryData);
        console.log('New itinerary: ', newItinerary);
        await newItinerary.save()
            .then(itinerary => res.json(itinerary))
            .catch(err => next(new CustomError(400, 'Save Error: ' + err)));
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
        if (!itinerary) {
            return next(new CustomError(404, 'Itinerary [' + req.params.id + '] not found for delete operation.'));
        }
        res.status(200).send('Itinerary [' + req.params.id +  '] has been deleted');
    } catch (err) {
        next(new CustomError(500, 'Itinerary deletion error: ' + err.message));
    }
});

// Speical Logic to split combined items array into separate arrays categorised by type: flight, hotel, activity
function splitItineraryItems(items) {
    const flights = items.filter(item => item.type === 'flight').map(({ type, sortDate, ...rest }) => rest);
    const hotels = items.filter(item => item.type === 'hotel').map(({ type, sortDate, ...rest }) => rest);
    const activities = items.filter(item => item.type === 'activity').map(({ type, sortDate, ...rest }) => rest);

    return { flights, hotels, activities };
}

module.exports = router;