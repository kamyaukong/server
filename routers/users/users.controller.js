const express = require('express');
const User = require('./users.model');
const customError = require('../../customError');
const router = express.Router();

// Data validation
const validateUserData = (req, res, next) => {
    // basic data validation
    if (!req.body.userID) {
        return next(new customError(400, 'User name required.'));
    } else if (!req.body.email) {
        return next(new customError(400, 'User email required.'));
    } else if (!req.body.password) {
        return next(new customError(400, 'Logon password required.'));
    }
    next();  // If valid, proceed to the route handler
};

// Get one users
router.get('/:id', (req, res, next) => {
    User.findById(req.params.id)
        .then(users => res.json(users))
        .catch(err => next(new customError(400, 'Error: ' + err)));
});

// Get all users
router.get('/', (req, res, next) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => next(new customError(400, 'Error: ' + err)));
});

// Append a user to database
router.post('/', validateUserData, async (req, res, next) => {
    try{
        // check if user ID already exist
        const existUser = await User.findOne({ userID: req.body.userID });
        if(existUser){
            return next(new customError(409, 'User ID ' + req.body.userID + ' already exist'))
        }
        const newUser = new User(req.body);
        newUser.save()
            .then(user => res.json(user))
            .catch(err => next(new customError(400, 'Error: ' + err)));
    } catch {
        next(new customError(500, 'Append user error: ' + err.message));
    }
});

// Update one user record by userID
router.put('/:id', validateUserData, async (req, res, next) => {
    try{
        const userID = req.params.id;
        delete req.body.userID;     //userID cannot make change
        const updatedUser = await User.findByIdAndUpdate(userID, req.body, { new: true });
        if(!updatedUser) {
            return next(new customError(404, 'User not found'));
        }
        res.json(updatedUser);
    } catch (err) {
        next(new customError(500, 'Update user error:' + err.message ))
    }
});

// Delete one user record by record ID
router.delete('/:userID', async (req, res, next) => {
    console.log("Attempting to delete user:", req.params.userID);
    const userID = req.params.userID;
    try {
        const user = await User.findByIdAndDelete({userID: userID});
        if (!user) {
            return next(new customError(404, 'User ' + userID + 'not found.'));
        }
        res.status(200).json({ message: 'User ' + userID + ' has been deleted.' });
    } catch (err) {
        //next(new customError(500, 'An error occurred while deleting the user:' + userID));
        next(new customError(500, err));
    }
});

module.exports = router;