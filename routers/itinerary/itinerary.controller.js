const express = require('express');
const Itinerary = require('./itinerary.model');
const CustomError = require('../../customError');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Middleware to validate mandatory fields
const validateItinerary = (req, res, next) => {
    // Add validation logic here
    next();
};

// POST /api/v1/itinerary - create itinerary
router.post('/', verifyToken, validateItinerary, async (req, res, next) => {

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
            .catch(err => next(new CustomError(400, 'Itinerary creation error: ' + err.message)));
    } catch (err) {
        next(new CustomError(500, 'Itinerary creation error: ' + err.message));
    }
});

// GET /api/v1/itinerary/:id - display particular itinerary by ID
router.get('/:id', verifyToken, async (req, res, next) => {
    try {
        // console.log('Get itinerary by ID: ', req.params.id);
        const itinerary = await Itinerary.findById(req.params.id);
        if (!itinerary) return res.status(404).send('Itinerary not found: ' + req.params.id);

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

        let combinedItems = [];

        // Combine and add a uniform 'sortDate' to each item
        if (itinerary.flights) {
            combinedItems = combinedItems.concat(itinerary.flights.map(item => ({ ...item.toObject(), type: 'flight', sortDate: item.departureDate })));
        }
        if (itinerary.hotels) {
            combinedItems = combinedItems.concat(itinerary.hotels.map(item => ({ ...item.toObject(), type: 'hotel', sortDate: item.checkInDate })));
        }
        if (itinerary.activities) {
            combinedItems = combinedItems.concat(itinerary.activities.map(item => ({ ...item.toObject(), type: 'activity', sortDate: item.activityDate })));
        }

        // Sort combined items by 'sortDate'
        combinedItems.sort((a, b) => new Date(a.sortDate) - new Date(b.sortDate));
        res.json({ mainDetails, items: combinedItems });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/v1/itinerary/:id/item/:itemType/:itemId - delete a specific item from an itinerary
router.delete('/:id/item/:itemType/:itemId', verifyToken, async (req, res, next) => {
    console.log('Delete item from itinerary: ', req.params);
    // try {
        const { id, itemType, itemId } = req.params;
        const itinerary = await Itinerary.findById(id);

        if (!itinerary) {
            return res.status(404).send('Itinerary not found');
        }

        const itemTypeMap = {
            flight: 'flights',
            hotel: 'hotels',
            activity: 'activities'
        };

        const pluralItemType = itemTypeMap[itemType];
        console.log('Plural item type: ', pluralItemType);
        // Check the itemType and filter the corresponding array
        if (itinerary[pluralItemType]) {
            console.log('Delete item from itinerary: ', pluralItemType, itemId);
            itinerary[pluralItemType] = itinerary[pluralItemType].filter(item => item._id.toString() !== itemId);
        } else {
            return res.status(400).send('Invalid item type');
        }

        await itinerary.save();
        res.status(200).send(`${itemType.slice(0, -1)} with ID ${itemId} has been deleted from itinerary ${id}`);
    // } catch (err) {
    //    next(new CustomError(500, 'Error deleting item: ' + err.message));
    //}
});

// GET /api/v1/itinerary/user - retrieve itinerary for specific user
router.get('/user/:userID', verifyToken, async (req, res, next) => {
    const userID = req.params.userID;
    console.log('Get itinerary by userID: ', userID);
    Itinerary.find({ userID: userID })
        .then(itineraries => res.json(itineraries))
        .catch(err => next(new CustomError(400, err.message)));
});

// PUT /api/v1/itinerary/:id - update particular itinerary by ID
router.put('/:id', verifyToken, validateItinerary, async (req, res, next) => {
    try {
        // Destructure the incoming data
        const { items, ...mainDetails } = req.body;
        const { flights, hotels, activities } = splitItineraryItems(items);

        const updateData = {
            ...mainDetails,
            flights,
            hotels,
            activities
        };
        const updatedItinerary = await Itinerary.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!updatedItinerary) 
            { return res.status(404).send('Itinerary not found'); }
        else
            { res.json(updatedItinerary); }
    } catch (err) {
        next(new CustomError(500, 'Itinerary creation error' + err.message));
    }
});

// DELETE /api/v1/itinerary/:id - delete particular itinerary by ID
router.delete('/:id', verifyToken, async (req, res, next) => {
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

// DELETE /api/v1/itinerary/:id/flight/:flightId - delete a flight from an itinerary
/*
router.delete('/:id/flight/:flightId', verifyToken, async (req, res, next) => {
    try {
        const { id, flightId } = req.params;
        const itinerary = await Itinerary.findById(id);
        if (!itinerary) {
            return res.status(404).send('Itinerary not found');
        }

        // Remove the flight from the flights array
        itinerary.flights = itinerary.flights.filter(flight => flight._id.toString() !== flightId);

        await itinerary.save();
        res.status(200).send(`Flight ${flightId} has been deleted from itinerary ${id}`);
    } catch (err) {
        next(new CustomError(500, 'Error deleting flight: ' + err.message));
    }
});
*/

// Speical Logic to split combined items array into separate arrays categorised by type: flight, hotel, activity
function splitItineraryItems(items) {
    const flights = items.filter(item => item.type === 'flight').map(({ type, sortDate, ...rest }) => rest);
    const hotels = items.filter(item => item.type === 'hotel').map(({ type, sortDate, ...rest }) => rest);
    const activities = items.filter(item => item.type === 'activity').map(({ type, sortDate, ...rest }) => rest);

    return { flights, hotels, activities };
}

module.exports = router;