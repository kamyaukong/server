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
            .catch(err => next(new CustomError(400, 'Save Error: ' + err.message)));
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

        // Extract main itinerary details
        const mainDetails = {
            _id: itinerary._id,
            name: itinerary.name,
            startDate: itinerary.startDate,
            endDate: itinerary.endDate,
            adults: itinerary.adults,
            children: itinerary.children,
            budget: itinerary.budget,
            userID: itinerary.userID
        };

        // Combine all sub-documents into one array
        let combinedArray = [];
        if (itinerary.flights) {
            combinedArray = combinedArray.concat(itinerary.flights.map(item => ({ ...item.toObject(), type: 'flight', sortDate: item.departureDate })));
        }
        if (itinerary.hotels) {
            combinedArray = combinedArray.concat(itinerary.hotels.map(item => ({ ...item.toObject(), type: 'hotel', sortDate: item.checkInDate })));
        }
        if (itinerary.activities) {
            combinedArray = combinedArray.concat(itinerary.activities.map(item => ({ ...item.toObject(), type: 'activity', sortDate: item.activityDate })));
        }

        // Sort the combined array by the unified 'sortDate' field
        combinedArray.sort((a, b) => new Date(a.sortDate) - new Date(b.sortDate));

        res.json({ mainDetails, items: combinedArray });
    } catch (err) {
        next(err);
    }
});

// PUT /api/v1/itinerary/:id - update particular itinerary by ID
router.put('/:id', validateItinerary, async (req, res, next) => {
    try {
        console.log('Update document: ', req.body);

        // Destructure the incoming data
        const { items, ...mainDetails } = req.body;

        // Transform combined items array back into separate arrays categorised by type: flight, hotel, activity
        const { flights, hotels, activities } = splitItineraryItems(items);

        // Prepare the update object
        const updateData = {
            ...mainDetails,
            flights,
            hotels,
            activities
        };

        // Perform the update
        const updatedItinerary = await Itinerary.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!updatedItinerary) return res.status(404).send('Itinerary find and update error:' + err.message);

        res.json(updatedItinerary);
    } catch (err) {
        console.error("Error updating itinerary:", err);
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

// Speical Logic to split combined items array into separate arrays categorised by type: flight, hotel, activity
function splitItineraryItems(items) {
    const flights = items.filter(item => item.type === 'flight').map(({ type, sortDate, ...rest }) => rest);
    const hotels = items.filter(item => item.type === 'hotel').map(({ type, sortDate, ...rest }) => rest);
    const activities = items.filter(item => item.type === 'activity').map(({ type, sortDate, ...rest }) => rest);

    return { flights, hotels, activities };
}

module.exports = router;